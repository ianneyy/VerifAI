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
    }

    private lateinit var windowManager: WindowManager
    private lateinit var floatingButton: ImageView
    private lateinit var mediaProjectionManager: MediaProjectionManager
    private var mediaProjection: MediaProjection? = null
    private var virtualDisplay: VirtualDisplay? = null
    private var imageReader: ImageReader? = null
    private var isButtonVisible = false

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
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.TOP or Gravity.START
        params.x = 50
        params.y = 200

        floatingButton = ImageView(this).apply {
            setImageResource(R.drawable.ic_floating)
            visibility = View.GONE  // Hidden by default
            setOnClickListener {
                Log.d(TAG, "Floating button clicked")
                captureScreenshot()
            }
            // Add background and styling
            setBackgroundResource(R.drawable.assistive_touch_background)
            alpha = 0.7f
            elevation = 8f
        }
        windowManager.addView(floatingButton, params)
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

    private fun showScreenshotPreview(bitmap: Bitmap) {
        try {
            val inflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as android.view.LayoutInflater
            val view = inflater.inflate(R.layout.screenshot_popup, null)

            // Set up the preview image
            val imageView = view.findViewById<ImageView>(R.id.screenshot_preview)
            imageView.setImageBitmap(bitmap)

            // Set up the content text
            val contentText = view.findViewById<TextView>(R.id.content_text)
            contentText.text = "No text extracted yet."

            // Set up result fields with default values
            view.findViewById<TextView>(R.id.matched_article).text = "0 matching article"
            view.findViewById<TextView>(R.id.content_authenticity).text = "Uncertain (40-79%)"
            view.findViewById<TextView>(R.id.source_credibility).text = ""
            view.findViewById<TextView>(R.id.face_detected).text = "Daniel Padilla"
            view.findViewById<TextView>(R.id.credibility_score).text = "80%"

            val displayMetrics = resources.displayMetrics
            val width = (displayMetrics.widthPixels * 0.9).toInt() // Use 90% of screen width
            val height = (displayMetrics.heightPixels * 0.8).toInt() // Use 80% of screen height

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
                windowManager.removeView(view)
            } catch (e: Exception) {
                // Ignore if no view exists
            }

            // Add the new preview
            windowManager.addView(view, params)
            Log.d(TAG, "Screenshot preview added successfully")

            // Set up dismiss button click listener
            view.findViewById<Button>(R.id.dismiss_button).setOnClickListener {
                try {
                    windowManager.removeView(view)
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

    override fun onDestroy() {
        super.onDestroy()
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
}
