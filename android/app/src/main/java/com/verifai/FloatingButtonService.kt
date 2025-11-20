package com.verifai

import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Environment
import android.os.IBinder
import android.util.Log
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import android.widget.Toast
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.Image
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import java.io.File
import java.io.FileOutputStream
import java.nio.ByteBuffer
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import android.provider.Settings
import android.app.Activity
import android.os.Handler
import android.os.Looper
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.content.ContentValues
import android.provider.MediaStore
import android.widget.TextView
import android.widget.Button
import java.net.HttpURLConnection
import java.io.ByteArrayOutputStream
import java.net.URL
import android.widget.LinearLayout
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.content.res.ColorStateList
import kotlin.math.roundToInt
import android.database.sqlite.SQLiteDatabase
import android.database.Cursor
import android.view.MotionEvent
import android.view.ViewGroup
import android.util.Base64
import org.json.JSONObject
import okhttp3.*
import okhttp3.sse.EventSource
import okhttp3.sse.EventSourceListener
import okhttp3.sse.EventSources
import okio.IOException
import okhttp3.OkHttpClient
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import android.widget.ProgressBar
import java.util.concurrent.TimeUnit
import org.json.JSONArray

data class VerificationLevel(
    val label: String,
    val description: String
)

class FloatingButtonService : Service() {
    companion object {
        private const val CHANNEL_ID = "floating_button_channel"
        private const val TAG = "FloatingButtonService"
        private var SCREEN_WIDTH = 1080
        private var SCREEN_HEIGHT = 2214
        private var SCREEN_DENSITY = 440
        private const val SCREEN_CAPTURE_REQUEST_CODE = 1000
        private var isStoppingService = false
        private var isCapturing = false  // Add capturing state flag
        
        private val verificationLevels = mapOf(
            "80-100" to VerificationLevel(
                "Real",
                "Matches trusted sources, writing style, and multiple articles."
            ),
            "60-79" to VerificationLevel(
                "Likely Real",
                "Mostly credible but may lack full source or match coverage."
            ),
            "40-59" to VerificationLevel(
                "Suspicious",
                "Some red flags in writing, source, or article consistency. May have contextual mismatches (e.g., celebrity or personality misalignment)."
            ),
            "20-39" to VerificationLevel(
                "Likely False",
                "Content contains multiple elements that appear fabricated."
            ),
            "0-19" to VerificationLevel(
                "Fake",
                "Content is confirmed to be false or deliberately misleading."
            )
        )

        private fun getVerificationLevel(value: Int): VerificationLevel {
            return when {
                value >= 80 -> verificationLevels["80-100"]!!
                value >= 60 -> verificationLevels["60-79"]!!
                value >= 40 -> verificationLevels["40-59"]!!
                value >= 20 -> verificationLevels["20-39"]!!
                else -> verificationLevels["0-19"]!!
            }
        }
    }

    private lateinit var windowManager: WindowManager
    private lateinit var floatingButton: ImageView
    private lateinit var mediaProjectionManager: MediaProjectionManager
    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null
    private var isButtonVisible = false
    private var popupView: View? = null  // Add this line to store the popup view
    
    // Variables for drag functionality
    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f
    private var buttonParams: WindowManager.LayoutParams? = null
    
    // Variables for two-click system
    private var isFirstClick = true
    private var clickResetHandler: Handler? = null
    private var clickResetRunnable: Runnable? = null

     override fun onCreate() {
        super.onCreate()
        Log.d(TAG, "Service created")

        mediaProjectionManager = getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager

        createNotificationChannel()
        startForegroundService()
        
        // Initialize window manager and add floating button
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        addFloatingButton()
    }
  
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "onStartCommand called with action: ${intent?.action}")
        
        when (intent?.action) {
            "SHOW_BUTTON" -> {
                Log.d(TAG, "Received SHOW_BUTTON action")
                if (::floatingButton.isInitialized) {
                    showFloatingButton()
                } else {
                    Log.e(TAG, "Floating button not initialized")
                    addFloatingButton()
                showFloatingButton()
                }
            }
            "HIDE_BUTTON" -> {
                Log.d(TAG, "Received HIDE_BUTTON action")
                hideFloatingButton()
            }
            "CHECK_VISIBILITY" -> {
                Log.d(TAG, "Received CHECK_VISIBILITY action")
                broadcastVisibilityState()
            }
            else -> {
                Log.d(TAG, "No action specified")
            }
        }

        val resultCode = intent?.getIntExtra("media_projection_result_code", -1) ?: -1
        val data = intent?.getParcelableExtra<Intent>("media_projection_data")
        Log.d(TAG, "Received resultCode: $resultCode")
        Log.d(TAG, "Received data: ${data != null}")

        if (resultCode == Activity.RESULT_OK && data != null) {
            mediaProjection = mediaProjectionManager.getMediaProjection(resultCode, data)
            Log.d(TAG, "MediaProjection initialized successfully!")

            mediaProjection?.registerCallback(object : MediaProjection.Callback() {
                override fun onStop() {
                    super.onStop()
                    Log.d(TAG, "MediaProjection stopped")
                    virtualDisplay?.release()
                    mediaProjection = null
                }
            }, Handler(Looper.getMainLooper()))
        } else {
            Log.e(TAG, "MediaProjection initialization failed!")
        }

        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Floating Button Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun startForegroundService() {
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Floating Button Service")
            .setContentText("This service keeps the floating button visible")
            .setSmallIcon(R.drawable.ic_floating)
            .build()
        startForeground(1, notification)
    }

    private fun addFloatingButton() {
        buttonParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )
        buttonParams?.gravity = Gravity.TOP or Gravity.START
        buttonParams?.x = 50
        buttonParams?.y = 200

        floatingButton = ImageView(this).apply {
            setImageResource(R.drawable.ic_floating)
            visibility = View.GONE  // Hidden by default
            
            // Set up touch listener for dragging
            setOnTouchListener { _, event ->
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = buttonParams?.x ?: 0
                        initialY = buttonParams?.y ?: 0
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val deltaX = (event.rawX - initialTouchX).toInt()
                        val deltaY = (event.rawY - initialTouchY).toInt()
                        
                        val newX = initialX + deltaX
                        val newY = initialY + deltaY
                        
                        // Get screen dimensions
                        val displayMetrics = resources.displayMetrics
                        val screenWidth = displayMetrics.widthPixels
                        val screenHeight = displayMetrics.heightPixels
                        
                        // Apply only boundary constraints (no center exclusion)
                        // Use smaller buffer to allow button to reach edges
                        val buttonBuffer = 50 // Small buffer in pixels
                        
                        val constrainedX = when {
                            newX < 0 -> 0
                            newX > screenWidth - buttonBuffer -> screenWidth - buttonBuffer
                            else -> newX
                        }
                        
                        val constrainedY = when {
                            newY < 0 -> 0
                            newY > screenHeight - buttonBuffer -> screenHeight - buttonBuffer
                            else -> newY
                        }
                        
                        buttonParams?.x = constrainedX
                        buttonParams?.y = constrainedY
                        
                        try {
                            windowManager.updateViewLayout(floatingButton, buttonParams)
                        } catch (e: Exception) {
                            Log.e(TAG, "Error updating button position", e)
                        }
                        true
                    }
                    MotionEvent.ACTION_UP -> {
                        // Check if this was a click (small movement)
                        val deltaX = (event.rawX - initialTouchX).toInt()
                        val deltaY = (event.rawY - initialTouchY).toInt()
                        val distance = kotlin.math.sqrt((deltaX * deltaX + deltaY * deltaY).toDouble())
                        
                        if (distance < 10) { // Small threshold for click detection
                            handleButtonClick()
                        }
                        true
                    }
                    else -> false
                }
            }
            
            // Add background and styling
            setBackgroundResource(R.drawable.assistive_touch_background)
            alpha = 0.2f  // Start with 50% opacity
            elevation = 8f
        }
        windowManager.addView(floatingButton, buttonParams)
        Log.d(TAG, "Floating button added to window manager")
    }

    private fun showFloatingButton() {
        if (::floatingButton.isInitialized) {
            Log.d(TAG, "Showing floating button")
            floatingButton.visibility = View.VISIBLE
            isButtonVisible = true
            broadcastVisibilityState()
        } else {
            Log.e(TAG, "Floating button not initialized when trying to show")
        }
    }

    private fun hideFloatingButton() {
        if (::floatingButton.isInitialized) {
            floatingButton.visibility = View.GONE
            isButtonVisible = false
            broadcastVisibilityState()
            Log.d(TAG, "Floating button hidden")
        }
    }

    private fun broadcastVisibilityState() {
        val intent = Intent("com.verifai.FLOATING_BUTTON_VISIBILITY_CHANGED")
        intent.putExtra("isVisible", isButtonVisible)
        sendBroadcast(intent)
        Log.d(TAG, "Broadcasted visibility state: $isButtonVisible")
    }

    fun isFloatingButtonVisible(): Boolean {
        return isButtonVisible
    }

    private fun getScreenMetrics() {
        val displayMetrics = resources.displayMetrics
        SCREEN_WIDTH = displayMetrics.widthPixels
        SCREEN_HEIGHT = displayMetrics.heightPixels
        SCREEN_DENSITY = displayMetrics.densityDpi
        Log.d(TAG, "Screen Size: ${SCREEN_WIDTH}x${SCREEN_HEIGHT}, Density: $SCREEN_DENSITY")
    }

    private var lastScreenshotTime = 0L

    private fun captureScreenshot() {
        if (mediaProjection == null) {
            Log.e(TAG, "MediaProjection is NULL! Attempting to restore...")
            restoreMediaProjection()
            return
        }

        if (isCapturing) {
            Log.d(TAG, "Screenshot capture already in progress")
            return
        }

        val currentTime = System.currentTimeMillis()
        if (currentTime - lastScreenshotTime < 1000) {
            Log.d(TAG, "Screenshot skipped to prevent duplication")
            return
        }
        lastScreenshotTime = currentTime

        try {
            isCapturing = true
            val displayMetrics = resources.displayMetrics
            val screenWidth = displayMetrics.widthPixels
            val screenHeight = displayMetrics.heightPixels
            val screenDensity = displayMetrics.densityDpi

            Log.d(TAG, "Capturing screenshot...")
            
            // Clean up previous resources
            cleanupScreenCapture()

            // Create new ImageReader instance with listener
            imageReader = ImageReader.newInstance(screenWidth, screenHeight, PixelFormat.RGBA_8888, 1)
            val imageAvailableListener = ImageReader.OnImageAvailableListener { reader ->
                if (!isCapturing) return@OnImageAvailableListener
                
                try {
                    val image = reader.acquireLatestImage()
                    if (image != null) {
                        Log.d(TAG, "Image acquired successfully")
                        saveImage(image)
                        isCapturing = false
                    } else {
                        Log.e(TAG, "Failed to acquire image - image is null")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error acquiring image", e)
                } finally {
                    isCapturing = false
                }
            }
            imageReader?.setOnImageAvailableListener(imageAvailableListener, Handler(Looper.getMainLooper()))

            // Create new VirtualDisplay
            virtualDisplay = mediaProjection?.createVirtualDisplay(
                "ScreenCapture",
                screenWidth,
                screenHeight,
                screenDensity,
                DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR,
                imageReader?.surface,
                null,
                null
            ) ?: run {
                Log.e(TAG, "Failed to create Virtual Display!")
                cleanupScreenCapture()
                isCapturing = false
                return
            }

            // Wait a bit before cleaning up to ensure image is captured
            Handler(Looper.getMainLooper()).postDelayed({
                cleanupScreenCapture()
                isCapturing = false
            }, 1500)

        } catch (e: SecurityException) {
            Log.e(TAG, "SecurityException: ${e.message}")
            cleanupScreenCapture()
            mediaProjection?.stop()
            mediaProjection = null
            isCapturing = false
            restoreMediaProjection()
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error during screenshot capture: ${e.message}")
            cleanupScreenCapture()
            isCapturing = false
        }
    }

    private fun cleanupScreenCapture() {
        try {
        virtualDisplay?.release()
        virtualDisplay = null
        imageReader?.close()
        imageReader = null
        } catch (e: Exception) {
            Log.e(TAG, "Error during cleanup", e)
        }
    }

    private fun saveImage(image: Image) {
        var bitmap: Bitmap? = null
        var croppedBitmap: Bitmap? = null
        
        try {
        val planes = image.planes
        val buffer = planes[0].buffer
        val pixelStride = planes[0].pixelStride
        val rowStride = planes[0].rowStride
        val rowPadding = rowStride - pixelStride * image.width
        val bitmapWidth = image.width + rowPadding / pixelStride

            bitmap = Bitmap.createBitmap(bitmapWidth, image.height, Bitmap.Config.ARGB_8888)
        bitmap.copyPixelsFromBuffer(buffer)

        // Crop the extra width
            croppedBitmap = Bitmap.createBitmap(bitmap, 0, 0, image.width, image.height)
        
            // Show preview popup
        showScreenshotPreview(croppedBitmap)

            // Send image to Python server
            sendImageToServer(croppedBitmap)

        val fileName = "Screenshot_${SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())}.png"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Save using MediaStore for Android 10+
            val contentValues = ContentValues().apply {
                put(MediaStore.Images.Media.DISPLAY_NAME, fileName)
                put(MediaStore.Images.Media.MIME_TYPE, "image/png")
                put(MediaStore.Images.Media.RELATIVE_PATH, "DCIM/Screenshots")
            }

            val resolver = contentResolver
            val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, contentValues)

            uri?.let {
                resolver.openOutputStream(it)?.use { outputStream ->
                    croppedBitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
                    outputStream.flush()
                }
                Log.d(TAG, "Screenshot saved to DCIM/Screenshots")
            } ?: Log.e(TAG, "Failed to save screenshot")

        } else {
            // Save to DCIM/Screenshots for older versions
            val screenshotsDir = File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DCIM), "Screenshots")
            if (!screenshotsDir.exists()) screenshotsDir.mkdirs()

            val file = File(screenshotsDir, fileName)
                FileOutputStream(file).use { fos ->
                    croppedBitmap.compress(Bitmap.CompressFormat.PNG, 100, fos)
                    fos.flush()
                }
                Log.d(TAG, "Screenshot saved to ${file.absolutePath}")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error saving image", e)
        } finally {
            try {
                bitmap?.recycle()
                image.close()
            } catch (e: Exception) {
                Log.e(TAG, "Error cleaning up image resources", e)
            }
        }
    }

    private fun insertData(context: Context, claim: String, source: String, verdict: Int, source_score: Int, writing_style: String, matched_article: Int, matched_person: String, face_recognition: String, created_at: String, method: String) {
        val dbPath = context.getDatabasePath("factchecker.db")

        val db = SQLiteDatabase.openDatabase(
            dbPath.absolutePath,
            null,
            SQLiteDatabase.OPEN_READWRITE
        )
        val values = ContentValues().apply {
            put("claim", claim)
            put("source", source)
            put("verdict", verdict)
            put("source_score", source_score)
            put("writing_style", writing_style)
            put("matched_article", matched_article)
            put("matched_person", matched_person)
            put("face_recognition", face_recognition)
            put("created_at", created_at)
            put("method", method)
        }

        val newRowId = db.insert("verified", null, values)

        if (newRowId != -1L) {
            Log.d("SQLite", "Inserted successfully with row id: $newRowId")
        } else {
            Log.e("SQLite", "Insert failed")
        }

        db.close()
    }
    private fun showScreenshotPreview(bitmap: Bitmap) {
        try {
        val inflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as android.view.LayoutInflater
            popupView = inflater.inflate(R.layout.screenshot_popup, null)  // Store the view

        // Set up the preview image
            val imageView = popupView?.findViewById<ImageView>(R.id.screenshot_preview)
            imageView?.setImageBitmap(bitmap)

            // Set up loading state
            val loadingContainer = popupView?.findViewById<LinearLayout>(R.id.loading_container)
            val contentContainer = popupView?.findViewById<LinearLayout>(R.id.content_container)
            val extractedText = popupView?.findViewById<LinearLayout>(R.id.extracted_text)
            
            val btnResults = popupView?.findViewById<Button>(R.id.btn_results_overview)
            val btnNews = popupView?.findViewById<Button>(R.id.btn_related_news)
            val layoutResults = popupView?.findViewById<LinearLayout>(R.id.layoutResults)
            val layoutNews = popupView?.findViewById<LinearLayout>(R.id.layoutNews)

                                    // Set initial states
            layoutResults?.visibility = View.VISIBLE
            layoutNews?.visibility = View.GONE
            btnResults?.setTextColor(Color.parseColor("#FFFFFF"))
            btnResults?.setBackgroundColor(Color.parseColor("#2979FF"))
            btnNews?.setTextColor(Color.parseColor("#2979FF"))
            btnNews?.setBackgroundColor(Color.parseColor("#f8fafc"))

            // Set up click listeners
            btnResults?.setOnClickListener {
                layoutResults?.visibility = View.VISIBLE
                layoutNews?.visibility = View.GONE
                                            
                btnResults?.setTextColor(Color.parseColor("#FFFFFF"))
                btnResults?.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#2979FF"))


                btnNews?.setTextColor(Color.parseColor("#2979FF"))
                btnNews?.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#f8fafc"))

            }

            btnNews?.setOnClickListener {
                layoutNews?.visibility = View.VISIBLE
                layoutResults?.visibility = View.GONE

                btnNews?.setTextColor(Color.parseColor("#FFFFFF"))
                btnNews?.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#2979FF"))

                                            
                btnResults?.setTextColor(Color.parseColor("#2979FF"))
                btnResults?.backgroundTintList = ColorStateList.valueOf(Color.parseColor("#f8fafc"))
             }
            // Show loading, hide content initially
            loadingContainer?.visibility = View.VISIBLE
            contentContainer?.visibility = View.GONE
            extractedText?.visibility = View.GONE

        // Set up the content text
            val contentText = popupView?.findViewById<TextView>(R.id.content_text)
            contentText?.text = "No text extracted yet."

        // Set up result fields with default values
            // popupView?.findViewById<TextView>(R.id.matched_article_score)?.text = "+25%"
            popupView?.findViewById<TextView>(R.id.content_authenticity_score)?.text = "+25%"
            popupView?.findViewById<TextView>(R.id.source_credibility_score)?.text = "+25%"
            popupView?.findViewById<TextView>(R.id.face_context_matching_score)?.text = "+25%"

        val params = WindowManager.LayoutParams(
                WindowManager.LayoutParams.MATCH_PARENT,
                WindowManager.LayoutParams.MATCH_PARENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.FILL
        
            // Remove any existing preview if it exists
            try {
                windowManager.removeView(popupView)
            } catch (e: Exception) {
                // Ignore if no view exists
            }

            // Add the new preview
            windowManager.addView(popupView, params)
            Log.d(TAG, "Screenshot preview added successfully")
            
            // Set up dismiss button click listener
            popupView?.findViewById<Button>(R.id.dismiss_button)?.setOnClickListener {
                try {
                    windowManager.removeView(popupView)
                    popupView = null
                    Log.d(TAG, "Screenshot preview dismissed")
                } catch (e: Exception) {
                    Log.e(TAG, "Error removing preview", e)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error showing screenshot preview", e)
            Toast.makeText(this, "Failed to show preview", Toast.LENGTH_SHORT).show()
        }
    }

private fun updateProgressBar(isLoading: Boolean, progress: Int = 0, message: String = "") {
    Handler(Looper.getMainLooper()).post {
        try {
            if (popupView != null) {
                val loadingContainer = popupView?.findViewById<LinearLayout>(R.id.loading_container)
                val contentContainer = popupView?.findViewById<LinearLayout>(R.id.content_container)
                val extractedText = popupView?.findViewById<LinearLayout>(R.id.extracted_text)
                
                val progressBar = popupView?.findViewById<ProgressBar>(R.id.progress_bar)
                val progressPercentLabel = popupView?.findViewById<TextView>(R.id.progress_percent_label)
                val progressMessage = popupView?.findViewById<TextView>(R.id.progress_message)
                
                if (isLoading) {
                    loadingContainer?.visibility = View.VISIBLE
                    contentContainer?.visibility = View.GONE
                    extractedText?.visibility = View.GONE

                    progressBar?.progress = progress
                    progressPercentLabel?.text = "$progress%"
                    progressMessage?.text = message
                } else {
                    loadingContainer?.visibility = View.GONE
                    contentContainer?.visibility = View.VISIBLE
                    extractedText?.visibility = View.VISIBLE
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error updating loading state", e)
        }
    }
}

private fun getServerUrl(): String {
    return if (isEmulator()) {
        "https://ovx7-verifai.hf.space"
    } else {
        "https://ovx7-verifai.hf.space"
    }
}

fun isEmulator(): Boolean {
    return (Build.FINGERPRINT.contains("generic")
            || Build.FINGERPRINT.lowercase().contains("emulator")
            || Build.MODEL.contains("Emulator")
            || Build.MODEL.contains("Android SDK built for x86")
            || Build.MANUFACTURER.contains("Genymotion")
            || (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
            || "google_sdk" == Build.PRODUCT)
}

private fun sendImageToServer(bitmap: Bitmap) {
    val context = this // Store context reference
    
    Thread {
        try {
            Log.d(TAG, "Starting image upload...")
            updateProgressBar(true, 0, "Starting upload...")
          
            // Convert Bitmap to Base64
            val outputStream = ByteArrayOutputStream()
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
            val imageBytes = outputStream.toByteArray()
            val base64Image = Base64.encodeToString(imageBytes, Base64.NO_WRAP)
            
            Log.d(TAG, "Image converted to base64, size: ${base64Image.length} chars")

            val serverUrl = "${getServerUrl()}/news"
            Log.d(TAG, "Connecting to: $serverUrl")

            // Configure OkHttpClient with appropriate timeouts for SSE
            val client = OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .readTimeout(0, TimeUnit.SECONDS) // SSE never times out
                .build()

            // val requestBody = JSONObject().put("image", base64Image).toString()
             // Build JSON request
            val requestBody = JSONObject().put("image", base64Image)
                .toString()
                .toRequestBody("application/json; charset=utf-8".toMediaType())

            val request = Request.Builder()
                .url(serverUrl)
                .post(requestBody)
                .addHeader("Accept", "text/event-stream")
                .addHeader("Cache-Control", "no-cache")
                .build()

            Log.d(TAG, "Sending request...")
            


             val listener = object : EventSourceListener() {

                override fun onOpen(eventSource: EventSource, response: Response) {
                    Log.d(TAG, "✅ Connected to SSE stream")
                    updateProgressBar(true, 5, "Connected to server...")
                }
                override fun onEvent(eventSource: EventSource, id: String?, type: String?, data: String) {
                    Log.d(TAG, "📩 SSE Data: $data")
                    try {
                            val json = JSONObject(data)
                            
                           
                            
                            val complete = json.optBoolean("complete", false)
                            val result = json.optJSONObject("result")
                            var progress = json.optInt("progress", 0)
                            val message = json.optString("message", "")
                            
                            Log.d(TAG, "Progress: $progress%, Message: $message, Complete: $complete")
                            
                            // Update progress bar (only if not complete)
                            if (!complete) {
                                updateProgressBar(true, progress, message)
                            }
                            
                            if (complete && result != null) {
                                Log.d(TAG, "Received complete result")
                                // Final results received
                                Handler(Looper.getMainLooper()).post {
                                    try {
                                        updateProgressBar(false, 100, "Verification complete")

                                        // Extract all data from result
                                        val cleanedText = result.optString("cleaned_text", "")
                                        val sourceName = result.optString("source_name", "Unknown")
                                        val score = result.optInt("score", 0)
                                        val sourceScore = result.optInt("source_score", 0)
                                        val matchedArticles = result.optJSONArray("matched_articles") ?: JSONArray()
                                        val prediction = result.optString("prediction", "Unknown")
                                        val matchPerson = result.optBoolean("match_person", false)
                                        val faceRecognition = result.optJSONObject("face_recognition")
                                        val artist = faceRecognition?.optString("artist", "Unknown") ?: "Unknown"
                                        val totalAveRounded = result.optDouble("total_ave_rounded", 0.0).roundToInt()

                                        Log.d(TAG, "Score: $score, Source: $sourceName, Articles: ${matchedArticles.length()}")

                                        // Update DonutProgress & labels
                                        val donutProgress = popupView?.findViewById<com.github.lzyzsd.circleprogress.DonutProgress>(R.id.donut_progress)
                                        val donutProgressPercent = popupView?.findViewById<TextView>(R.id.progress_percent)
                                        val donutProgressLabel = popupView?.findViewById<TextView>(R.id.progress_label)

                                        val label = when {
                                            score == 100 -> "High Credibility"
                                            score >= 75 -> "Generally Credible"
                                            score >= 60 -> "Credible with Exceptions"
                                            score >= 40 -> "Questionable"
                                            else -> "Likely Fake"
                                        }
                                        
                                        val colorLabel = when {
                                            score == 100 -> "#4CD964"
                                            score >= 75 -> "#a3e635"
                                            score >= 60 -> "#FFCC00"
                                            score >= 40 -> "#fb923c"
                                            else -> "#FF3B30"
                                        }

                                        donutProgressPercent?.setTextColor(Color.parseColor(colorLabel))
                                        donutProgressLabel?.setTextColor(Color.parseColor(colorLabel))
                                        donutProgressPercent?.text = "$score%"
                                        donutProgressLabel?.text = label
                                        donutProgress?.apply {
                                            progress = score
                                            finishedStrokeColor = Color.parseColor(colorLabel)
                                        }

                                        // Update scores
                                        popupView?.findViewById<TextView>(R.id.source_credibility_score)?.apply {
                                            text = "+$sourceScore%"
                                            setTextColor(Color.parseColor(if (sourceScore >= 1) "#9DFFBA" else "#FF797B"))
                                        }

                                        val predictionScore = if (prediction == "Credible") "+19" else "+0"
                                        popupView?.findViewById<TextView>(R.id.content_authenticity_score)?.apply {
                                            text = predictionScore
                                            setTextColor(Color.parseColor(if (predictionScore == "+19") "#9DFFBA" else "#FF797B"))
                                        }

                                        val matchedPersonScore = if (matchPerson || artist == "No face detected") "+9" else "+0"
                                        popupView?.findViewById<TextView>(R.id.face_context_matching_score)?.apply {
                                            text = matchedPersonScore
                                            setTextColor(Color.parseColor(if (matchedPersonScore == "+9") "#9DFFBA" else "#FF797B"))
                                        }

                                        // Update content
                                        popupView?.findViewById<TextView>(R.id.content_text)?.text = cleanedText
                                        popupView?.findViewById<TextView>(R.id.content_source)?.text = "Source: $sourceName"

                                        // Populate matched articles
                                        val articlesContainer = popupView?.findViewById<LinearLayout>(R.id.articles_container)
                                        articlesContainer?.removeAllViews()

                                        if (matchedArticles.length() == 0) {
                                            val noRelatedNewsText = TextView(context).apply {
                                                text = "No related news"
                                                setTextColor(Color.RED)
                                                textSize = 16f
                                                gravity = Gravity.CENTER
                                                setPadding(0, 16, 0, 16)
                                            }
                                            articlesContainer?.addView(noRelatedNewsText)
                                        } else {
                                            for (i in 0 until matchedArticles.length()) {
                                                val article = matchedArticles.getJSONObject(i)
                                                val title = article.optString("title", "No title")
                                                val source = article.optString("source", "Unknown source")
                                                val snippet = article.optString("snippet", "")
                                                val similarity = article.optInt("similarity", 0)

                                                val articleLayout = LinearLayout(context).apply {
                                                    orientation = LinearLayout.VERTICAL
                                                    setBackgroundColor(Color.parseColor("#f8fafc"))
                                                    setPadding(12, 12, 12, 12)
                                                    val params = LinearLayout.LayoutParams(
                                                        LinearLayout.LayoutParams.MATCH_PARENT,
                                                        LinearLayout.LayoutParams.WRAP_CONTENT
                                                    )
                                                    params.setMargins(0, 0, 0, 8)
                                                    layoutParams = params
                                                }

                                                // Title
                                                articleLayout.addView(TextView(context).apply {
                                                    text = title
                                                    setTextColor(Color.parseColor("#0f172a"))
                                                    textSize = 16f
                                                    setPadding(0, 0, 0, 4)
                                                })

                                                // Source and Similarity row
                                                val sourceSimilarityLayout = LinearLayout(context).apply {
                                                    orientation = LinearLayout.HORIZONTAL
                                                    gravity = Gravity.CENTER_VERTICAL
                                                    setPadding(0, 4, 0, 4)
                                                }

                                                sourceSimilarityLayout.addView(TextView(context).apply {
                                                    text = "Source: $source"
                                                    setTextColor(Color.parseColor("#6C63FF"))
                                                    textSize = 12f
                                                    layoutParams = LinearLayout.LayoutParams(
                                                        0,
                                                        LinearLayout.LayoutParams.WRAP_CONTENT,
                                                        1f
                                                    )
                                                })

                                                sourceSimilarityLayout.addView(TextView(context).apply {
                                                    text = "Similarity: $similarity%"
                                                    setTextColor(Color.parseColor("#22c55e"))
                                                    textSize = 12f
                                                    gravity = Gravity.END
                                                })

                                                articleLayout.addView(sourceSimilarityLayout)

                                                // Snippet
                                                articleLayout.addView(TextView(context).apply {
                                                    text = snippet
                                                    setTextColor(Color.parseColor("#AAAAAA"))
                                                    textSize = 14f
                                                    setPadding(0, 4, 0, 0)
                                                })

                                                articlesContainer?.addView(articleLayout)
                                            }
                                        }
                                        
                                        Toast.makeText(context, "Verification complete!", Toast.LENGTH_SHORT).show()
                                    } catch (e: Exception) {
                                        Log.e(TAG, "Error updating final result", e)
                                        Toast.makeText(context, "Error displaying results: ${e.message}", Toast.LENGTH_SHORT).show()
                                    }
                                }
                                
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "⚠️ JSON parse error: ${e.message}")
                            
                        }
                }
                override fun onClosed(eventSource: EventSource) {
                    Log.d(TAG, "🔚 SSE connection closed")
                    updateProgressBar(false)
                }
                override fun onFailure(eventSource: EventSource, t: Throwable?, response: Response?) {
                    Log.e(TAG, "❌ SSE Error: ${t?.message}", t)
                    Handler(Looper.getMainLooper()).post {
                        updateProgressBar(false)
                        Toast.makeText(context, "Connection error: ${t?.message}", Toast.LENGTH_LONG).show()
                    }
                }


             }
              // Start SSE stream
            EventSources.createFactory(client).newEventSource(request, listener)
           
        } catch (e: Exception) {
            Log.e(TAG, "Error in server communication", e)
            e.printStackTrace()
            Handler(Looper.getMainLooper()).post {
                updateProgressBar(false)
                Toast.makeText(context, "Network error: ${e.message}", Toast.LENGTH_LONG).show()
            }
        }
    }.start()
}
    private fun restoreMediaProjection() {
        cleanupScreenCapture()

        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        intent.putExtra("request_media_projection", true) // Tell MainActivity to request permission
        startActivity(intent)

        stopSelf() 
    }

    private fun setButtonVisibility(visible: Boolean) {
        if (::floatingButton.isInitialized) {
            try {
                floatingButton.post {
                    floatingButton.visibility = if (visible) View.VISIBLE else View.GONE
                    isButtonVisible = visible
                    Log.d(TAG, "Button visibility set to: $visible")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error setting button visibility", e)
            }
        }
    }

    private fun handleButtonClick() {
        if (isFirstClick) {
            // First click - increase opacity and start timer
            Log.d(TAG, "First click - increasing opacity")
            floatingButton.alpha = 1.0f
            isFirstClick = false
            
            // Cancel any existing reset timer
            clickResetRunnable?.let { clickResetHandler?.removeCallbacks(it) }
            
            // Set up 5-second timer to reset
            clickResetHandler = Handler(Looper.getMainLooper())
            clickResetRunnable = Runnable {
                Log.d(TAG, "Timer expired - resetting button")
                floatingButton.alpha = 0.5f
                isFirstClick = true
            }
            clickResetHandler?.postDelayed(clickResetRunnable!!, 5000)
            
        } else {
            // Second click within 5 seconds - capture screenshot
            Log.d(TAG, "Second click - capturing screenshot")
            captureScreenshot()
            
            // Reset immediately after screenshot
            floatingButton.alpha = 0.5f
            isFirstClick = true
            
            // Cancel the timer since we're resetting
            clickResetRunnable?.let { clickResetHandler?.removeCallbacks(it) }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        // Clean up timer
        clickResetRunnable?.let { clickResetHandler?.removeCallbacks(it) }
        
        if (::floatingButton.isInitialized) {
            windowManager.removeView(floatingButton)
        }
        virtualDisplay?.release()
        virtualDisplay = null
        mediaProjection?.stop()
        mediaProjection = null
        Log.d(TAG, "Service Destroyed")
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }

    private fun updateVerificationUI(score: Int) {
        val verificationLevel = getVerificationLevel(score)
        
        Handler(Looper.getMainLooper()).post {
            try {
                if (popupView != null) {
                    // Update the description text
                    popupView?.findViewById<TextView>(R.id.description)?.text = verificationLevel.description
                    
                    // Update the label
                    
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error updating verification UI", e)
            }
        }
    }
}
