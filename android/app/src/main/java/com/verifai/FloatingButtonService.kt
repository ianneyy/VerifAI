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

        val displayMetrics = resources.displayMetrics
            val width = (displayMetrics.widthPixels * 0.9).toInt()
            val height = (displayMetrics.heightPixels * 0.8).toInt()

        val params = WindowManager.LayoutParams(
                width,
                height,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN or
                WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.CENTER
        
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

    private fun showLoadingState(isLoading: Boolean) {
        Handler(Looper.getMainLooper()).post {
            try {
                if (popupView != null) {
                    val loadingContainer = popupView?.findViewById<LinearLayout>(R.id.loading_container)
                    val contentContainer = popupView?.findViewById<LinearLayout>(R.id.content_container)
                    val extractedText = popupView?.findViewById<LinearLayout>(R.id.extracted_text)
                    
                    if (isLoading) {
                        loadingContainer?.visibility = View.VISIBLE
                        contentContainer?.visibility = View.GONE
                        extractedText?.visibility = View.GONE
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
            // "http://10.0.2.2:5001"
            "https://ovx7-verifai.hf.space"
        } else {
            // "http://10.114.160.193:5001" // <-- your laptop's real IP address
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
        Thread {
            try {
                // Show loading state
                showLoadingState(true)
                val serverUrl = getServerUrl()
                // Send image to /news endpoint
                val url = URL("$serverUrl/news")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.doOutput = true

                // Generate a unique boundary
                val boundary = "*****" + System.currentTimeMillis() + "*****"
                connection.setRequestProperty("Content-Type", "multipart/form-data; boundary=$boundary")

                // Convert bitmap to byte array
                val outputStream = ByteArrayOutputStream()
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
                val imageBytes = outputStream.toByteArray()

                // Write the multipart form data
                connection.outputStream.use { os ->
                    os.write("--$boundary\r\n".toByteArray())
                    os.write("Content-Disposition: form-data; name=\"image\"; filename=\"screenshot.png\"\r\n".toByteArray())
                    os.write("Content-Type: image/png\r\n\r\n".toByteArray())
                    os.write(imageBytes)
                    os.write("\r\n".toByteArray())
                    os.write("--$boundary--\r\n".toByteArray())
                }

                // Get the response code
                val responseCode = connection.responseCode
                Log.d(TAG, "News endpoint response code: $responseCode")

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    val response = connection.inputStream.bufferedReader().use { it.readText() }
                    Log.d(TAG, "News endpoint response: $response")

                    try {
                        // Parse the JSON response
                        val jsonResponse = org.json.JSONObject(response)
                        
                        // Get the cleaned text and update the content text in the popup
                        val cleanedText = jsonResponse.getString("cleaned_text")
                        val sourceName = jsonResponse.getString("source_name")
                        val score = jsonResponse.getInt("score")


                        val sourceScore = jsonResponse.getInt("source_score")
                
                        val sourceCredibilityIssueModal = if (sourceScore >= 1 ) "" else "Click to see possible issues"

                        val matchedArticles = jsonResponse.getJSONArray("matched_articles")
                        val matchedArticleScore = jsonResponse.getDouble("total_ave_rounded")

                        val whole = matchedArticleScore.roundToInt()

                        // val matchedArticlesCount = matchedArticles.length()

                   
                        val matchedArticlesCountIssueModal = if (matchedArticleScore >= 1) "" else "Click to see possible issues"

                        val matchedPerson = jsonResponse.getBoolean("match_person")
                        val faceRecognition = jsonResponse.getJSONObject("face_recognition").getString("artist")
                        Log.d(TAG, "matchedPerson: $matchedPerson, faceRecognition: $faceRecognition")

                        val matchedPersonScore = if (matchedPerson || faceRecognition == "No face detected") "+9" else "+0"
                        val matchedPersonIssueModal = if (matchedPerson || faceRecognition == "No face detected") "" else "Click to see possible issues"

                        
                        val prediction = jsonResponse.getString("prediction")
                        val predictionScore = if (prediction == "Credible") "+19" else "+0"
                        val predictionIssueModal = if (prediction == "Credible") "" else "Click to see possible issues"


                        // val faceRecognition = jsonResponse.getJSONObject("face_recognition").getString("artist")
                       
                       val label = when {
                            score == 100 -> "High Credibility"
                            score >= 75 -> "Generally Credible"
                            score >= 60 -> "Credible with Exceptions"
                            score >= 40 -> "Proceed with Caution"
                            else -> "Proceed with Maximum Caution"
                        }
                        val colorLabel = when {
                            score == 100 -> "#4CD964"
                            score >= 75 -> "#a3e635"
                            score >= 60 -> "#FFCC00"
                            score >= 40 -> "#fb923c"
                            else -> "#FF3B30"
                        }
                        val currentTime = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())

                      
                        insertData(this, cleanedText, sourceName, score, sourceScore, predictionScore, whole, matchedPersonScore, faceRecognition, currentTime, "VerifAI Assistant")

                        // Update UI on the main thread
                        Handler(Looper.getMainLooper()).post {
                            try {
                                if (popupView != null) {
                                  
                                    // Get the DonutProgress view from popup
                                    val donutProgress = popupView?.findViewById<com.github.lzyzsd.circleprogress.DonutProgress>(R.id.donut_progress)

                                    val donutProgressPercent = popupView?.findViewById<TextView>(R.id.progress_percent)
                                    val donutProgressLabel = popupView?.findViewById<TextView>(R.id.progress_label)
                                    
                                    donutProgressPercent?.setTextColor(Color.parseColor(colorLabel))
                                    donutProgressLabel?.setTextColor(Color.parseColor(colorLabel))


                                    // Update gauge if available
                                    updateVerificationUI(score)

                                    donutProgressPercent?.text = "$score%"
                                    donutProgressLabel?.text = label
                                    
                                    donutProgress?.apply {
                                        progress = score.toFloat()
                                        finishedStrokeColor = Color.parseColor(colorLabel)

                                    }

                                    // sourceCredibilityScore
                                    popupView?.findViewById<TextView>(R.id.source_credibility_score)?.text = "+$sourceScore%"
                                    val scText = popupView?.findViewById<TextView>(R.id.source_credibility_score)
                                    val scColor = if (sourceScore >= 1) "#9DFFBA" else "#FF797B"
                                    scText?.setTextColor(Color.parseColor(scColor))

                                    val sourceCredibilityIssueText = popupView?.findViewById<TextView>(R.id.source_credibility_modal_issue)
                                    sourceCredibilityIssueText?.text = sourceCredibilityIssueModal
                                    sourceCredibilityIssueText?.visibility = if (sourceCredibilityIssueModal.isEmpty()) View.GONE else View.VISIBLE
                                    val scBorderColor = popupView?.findViewById<View>(R.id.source_credibility_border_color)
                                    scBorderColor?.setBackgroundColor(Color.parseColor(scColor))



                                      // predictionScore
                                    popupView?.findViewById<TextView>(R.id.content_authenticity_score)?.text = "$predictionScore%"
                                    val pText = popupView?.findViewById<TextView>(R.id.content_authenticity_score)
                                    val pColor = if (predictionScore == "+19") "#9DFFBA" else "#FF797B"
                                    pText?.setTextColor(Color.parseColor(pColor))
                                    val predictionIssueText = popupView?.findViewById<TextView>(R.id.content_authenticity_modal_issue)
                                    predictionIssueText?.text = predictionIssueModal
                                    predictionIssueText?.visibility = if (predictionIssueModal.isEmpty()) View.GONE else View.VISIBLE
                                    val pBorderColor = popupView?.findViewById<View>(R.id.content_authenticity_border_color)
                                    pBorderColor?.setBackgroundColor(Color.parseColor(pColor))

                                    val wholeNum = whole.toString()

                                      // matchedArticlesCountScore
                                    // popupView?.findViewById<TextView>(R.id.matched_article_score)?.text = "+$wholeNum%"
                                    // val maText = popupView?.findViewById<TextView>(R.id.matched_article_score)
                                    // val maColor = if (matchedArticleScore >= 1) "#9DFFBA" else "#FF797B"
                                    // maText?.setTextColor(Color.parseColor(maColor))
                                    // val matchedArticlesCountIssueText = popupView?.findViewById<TextView>(R.id.matched_article_modal_issue)
                                    // matchedArticlesCountIssueText?.text = matchedArticlesCountIssueModal
                                    // matchedArticlesCountIssueText?.visibility = if (matchedArticlesCountIssueModal.isEmpty()) View.GONE else View.VISIBLE
                                    // val maBorderColor = popupView?.findViewById<View>(R.id.matched_article_border_color)
                                    // maBorderColor?.setBackgroundColor(Color.parseColor(maColor))
                                    
                                      // matchedPersonScore
                                    popupView?.findViewById<TextView>(R.id.face_context_matching_score)?.text = "$matchedPersonScore%"
                                    val mpText = popupView?.findViewById<TextView>(R.id.face_context_matching_score)
                                    val mpColor = if (matchedPersonScore == "+9") "#9DFFBA" else "#FF797B"
                                    mpText?.setTextColor(Color.parseColor(mpColor))
                                     val matchedPersonIssueText = popupView?.findViewById<TextView>(R.id.face_context_matching_modal_issue)
                                    matchedPersonIssueText?.text = matchedPersonIssueModal
                                    matchedPersonIssueText?.visibility = if (matchedPersonIssueModal.isEmpty()) View.GONE else View.VISIBLE
                                    val mpBorderColor = popupView?.findViewById<View>(R.id.face_context_matching_border_color)
                                    mpBorderColor?.setBackgroundColor(Color.parseColor(mpColor))



                                    // // Update the content text
                                    popupView?.findViewById<TextView>(R.id.content_text)?.text = cleanedText
                                    popupView?.findViewById<TextView>(R.id.content_source)?.text = "Source: $sourceName"
                                    
                                    // // Update face recognition
                                    // popupView?.findViewById<TextView>(R.id.face_detected)?.text = faceRecognition
                                    
                                    // // Update source credibility
                                    // popupView?.findViewById<TextView>(R.id.source_credibility)?.apply {
                                    //     text = sourceCredibility
                                    //     val color = if (text.equals("Credible")) {
                                    //         android.graphics.Color.parseColor("#36AE7C")
                                    //     } else {
                                    //         android.graphics.Color.parseColor("#EB5353")
                                    //     }
                                    //     setTextColor(color)
                                    // }
                                    
                                    // // Update matched articles count
                                    // popupView?.findViewById<TextView>(R.id.matched_article)?.text = "${matchedArticles.length()} matching article(s)"
                                    
                                    // // Update content authenticity
                                    // popupView?.findViewById<TextView>(R.id.content_authenticity)?.text = "Authentic (80-100%)"
                                    
                                    // Get the container for articles
                                    val articlesContainer = popupView?.findViewById<LinearLayout>(R.id.articles_container)
                                    articlesContainer?.removeAllViews() // Clear existing articles

                                    // Check if there are no matched articles
                                    if (matchedArticles.length() == 0) {
                                        // Create a TextView for "No related news"
                                        val noRelatedNewsText = TextView(this).apply {
                                            text = "No related news"
                                            setTextColor(Color.parseColor("#FF0000")) // Optional: Change color if desired
                                            textSize = 16f
                                            layoutParams = LinearLayout.LayoutParams(
                                                LinearLayout.LayoutParams.MATCH_PARENT,
                                                LinearLayout.LayoutParams.WRAP_CONTENT
                                            ).apply {
                                                topMargin = 16
                                            }
                                            gravity = Gravity.CENTER // Center the text in the container
                                        }
                                        // Add the "No related news" message to the container
                                        articlesContainer?.addView(noRelatedNewsText)
                                    } else {
                                        // Add each article to the container
                                        for (i in 0 until matchedArticles.length()) {
                                            val article = matchedArticles.getJSONObject(i)
                                            val title = article.getString("title")
                                            val source = article.getString("source")
                                            val snippet = article.getString("snippet")
                                            val similarity = article.getInt("similarity")
                                            
                                            // Create article layout
                                            val articleLayout = LinearLayout(this).apply {
                                                layoutParams = LinearLayout.LayoutParams(
                                                    LinearLayout.LayoutParams.MATCH_PARENT,
                                                    LinearLayout.LayoutParams.WRAP_CONTENT
                                                ).apply {
                                                    bottomMargin = 16
                                                }
                                                setBackgroundColor(Color.parseColor("#f8fafc"))
                                                orientation = LinearLayout.VERTICAL
                                                setPadding(12, 12, 12, 12)
                                            }
                                            
                                            // Add title
                                            articleLayout.addView(TextView(this).apply {
                                                text = title
                                                setTextColor(Color.parseColor("#0f172a"))
                                                textSize = 16f
                                                layoutParams = LinearLayout.LayoutParams(
                                                    LinearLayout.LayoutParams.MATCH_PARENT,
                                                    LinearLayout.LayoutParams.WRAP_CONTENT
                                                )
                                            })
                                            
                                            // Add source
                                            // articleLayout.addView(TextView(this).apply {
                                            //     text = "Source: $source"
                                            //     setTextColor(Color.parseColor("#6C63FF"))
                                            //     textSize = 12f
                                            //     layoutParams = LinearLayout.LayoutParams(
                                            //         LinearLayout.LayoutParams.MATCH_PARENT,
                                            //         LinearLayout.LayoutParams.WRAP_CONTENT
                                            //     ).apply {
                                            //         topMargin = 4
                                            //     }
                                            // })

                                              // Add source and similarity in a horizontal layout
                                                val sourceSimilarityLayout = LinearLayout(this).apply {
                                                    layoutParams = LinearLayout.LayoutParams(
                                                        LinearLayout.LayoutParams.MATCH_PARENT,
                                                        LinearLayout.LayoutParams.WRAP_CONTENT
                                                    ).apply {
                                                        topMargin = 4
                                                    }
                                                    orientation = LinearLayout.HORIZONTAL
                                                    gravity = Gravity.CENTER_VERTICAL
                                                }
                                              // Source TextView (left aligned)
                                                val sourceTextView = TextView(this).apply {
                                                    text = "Source: $source"
                                                    setTextColor(Color.parseColor("#6C63FF"))
                                                    textSize = 12f
                                                    layoutParams = LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f)
                                                }

                                                                                            // Similarity TextView (right aligned)
                                                val similarityTextView = TextView(this).apply {
                                                    text = "Similarity: $similarity%"
                                                    setTextColor(Color.parseColor("#22c55e")) // Light blue
                                                    textSize = 12f
                                                    gravity = Gravity.END
                                                    layoutParams = LinearLayout.LayoutParams(
                                                        LinearLayout.LayoutParams.WRAP_CONTENT,
                                                        LinearLayout.LayoutParams.WRAP_CONTENT
                                                    )
                                                }

                                                   // Add both TextViews to the horizontal layout
                                            sourceSimilarityLayout.addView(sourceTextView)
                                            sourceSimilarityLayout.addView(similarityTextView)
                                            articleLayout.addView(sourceSimilarityLayout)
                                            // Add snippet
                                            articleLayout.addView(TextView(this).apply {
                                                text = snippet
                                                setTextColor(Color.parseColor("#AAAAAA"))
                                                textSize = 14f
                                                layoutParams = LinearLayout.LayoutParams(
                                                    LinearLayout.LayoutParams.MATCH_PARENT,
                                                    LinearLayout.LayoutParams.WRAP_CONTENT
                                                ).apply {
                                                    topMargin = 4
                                                }
                                            })
                                            
                                            // Add the article layout to the container
                                            articlesContainer?.addView(articleLayout)
                                        }
                                    }

                                    
                                    Log.d(TAG, "Updated TextViews with JSON response")
                                    
                                    // Hide loading state after all updates are done
                                    showLoadingState(false)
                                } else {
                                    Log.e(TAG, "Popup view is null")
                                    showLoadingState(false)
                                }
                            } catch (e: Exception) {
                                Log.e(TAG, "Error updating TextViews", e)
                                showLoadingState(false)
                            }
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing JSON response", e)
                        showLoadingState(false)
                    }
                } else {
                    val errorStream = connection.errorStream
                    if (errorStream != null) {
                        val errorMessage = errorStream.bufferedReader().use { it.readText() }
                        Log.e(TAG, "News endpoint error response: $errorMessage")
                    }
                    showLoadingState(false)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error in server communication", e)
                showLoadingState(false)
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
