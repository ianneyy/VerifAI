package com.verifai

import android.content.Intent
import android.content.Context
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.Promise
import android.provider.Settings
import android.widget.Toast
import android.util.Log
import android.os.Build
import android.app.ActivityManager
import android.content.BroadcastReceiver
import android.content.IntentFilter
import android.app.Activity
import com.facebook.react.bridge.ActivityEventListener
import android.media.projection.MediaProjectionManager

class FloatingButtonServiceModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), ActivityEventListener {
    private var mediaProjectionManager: MediaProjectionManager? = null
    private var pendingShowBubble = false

    init {
        reactContext.addActivityEventListener(this)
        mediaProjectionManager = reactContext.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
    }

    override fun getName(): String {
        return "FloatingButtonServiceModule"
    }

    private fun startService(context: Context, shouldShow: Boolean, resultCode: Int = -1, data: Intent? = null) {
        val serviceIntent = Intent(context, FloatingButtonService::class.java).apply {
            putExtra("show_button", shouldShow)
            putExtra("media_projection_result_code", resultCode)
            if (data != null) {
                putExtra("media_projection_data", data)
            }
        }
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent)
        } else {
            context.startService(serviceIntent)
        }
    }

    @ReactMethod
    fun showBubble(promise: Promise) {
        val context = reactApplicationContext
        Log.d("FloatingButtonServiceModule", "showBubble called")
        
        if (!Settings.canDrawOverlays(context)) {
            Log.e("FloatingButtonServiceModule", "Overlay permission not granted")
            Toast.makeText(context, "Overlay permission required", Toast.LENGTH_SHORT).show()
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                android.net.Uri.parse("package:${context.packageName}")
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
            promise.reject("ERROR", "Overlay permission not granted")
            return
        }

        try {
            // Start the service first
            val serviceIntent = Intent(context, FloatingButtonService::class.java)
            serviceIntent.action = "SHOW_BUTTON"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }

            // Then request media projection permission
            pendingShowBubble = true
            val captureIntent = mediaProjectionManager?.createScreenCaptureIntent()
            currentActivity?.startActivityForResult(captureIntent, MEDIA_PROJECTION_REQUEST_CODE)
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e("FloatingButtonServiceModule", "Error requesting media projection", e)
            Toast.makeText(context, "Error starting screen capture", Toast.LENGTH_SHORT).show()
            promise.reject("ERROR", "Failed to request media projection: ${e.message}")
        }
    }

    @ReactMethod
    fun hideBubble(promise: Promise) {
        val context = reactApplicationContext
        Log.d("FloatingButtonServiceModule", "hideBubble called")
        try {
            val serviceIntent = Intent(context, FloatingButtonService::class.java)
            serviceIntent.action = "HIDE_BUTTON"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
            Log.d("FloatingButtonServiceModule", "Service started with button hidden")
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e("FloatingButtonServiceModule", "Error hiding button", e)
            promise.reject("ERROR", "Failed to hide button: ${e.message}")
        }
    }

    @ReactMethod
    fun isFloatingButtonVisible(promise: Promise) {
        val context = reactApplicationContext
        Log.d("FloatingButtonServiceModule", "isFloatingButtonVisible called")
        
        // Check if service is running
        val isServiceRunning = isServiceRunning(FloatingButtonService::class.java)
        if (!isServiceRunning) {
            Log.d("FloatingButtonServiceModule", "Service is not running, returning false")
            promise.resolve(false)
            return
        }

        // Start service with CHECK_VISIBILITY action
        val intent = Intent(context, FloatingButtonService::class.java)
        intent.action = "CHECK_VISIBILITY"
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent)
        } else {
            context.startService(intent)
        }

        // Create a broadcast receiver to get the actual visibility state
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val isVisible = intent?.getBooleanExtra("isVisible", false) ?: false
                Log.d("FloatingButtonServiceModule", "Received visibility state: $isVisible")
                context?.unregisterReceiver(this)
                promise.resolve(isVisible)
            }
        }

        // Register receiver with RECEIVER_NOT_EXPORTED flag for Android 14+ compatibility
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.registerReceiver(
                receiver,
                IntentFilter("com.verifai.FLOATING_BUTTON_VISIBILITY_CHANGED"),
                Context.RECEIVER_NOT_EXPORTED
            )
        } else {
            context.registerReceiver(
                receiver,
                IntentFilter("com.verifai.FLOATING_BUTTON_VISIBILITY_CHANGED")
            )
        }
    }

    private fun isServiceRunning(serviceClass: Class<*>): Boolean {
        val manager = reactApplicationContext.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        for (service in manager.getRunningServices(Int.MAX_VALUE)) {
            if (serviceClass.name == service.service.className) {
                return true
            }
        }
        return false
    }

    override fun onActivityResult(activity: Activity?, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == MEDIA_PROJECTION_REQUEST_CODE) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                Log.d("FloatingButtonServiceModule", "Media projection permission granted")
                if (pendingShowBubble) {
                    startService(reactApplicationContext, true, resultCode, data)
                    pendingShowBubble = false
                }
            } else {
                Log.e("FloatingButtonServiceModule", "Media projection permission denied")
                Toast.makeText(reactApplicationContext, "Screen capture permission denied", Toast.LENGTH_SHORT).show()
                pendingShowBubble = false
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        // Not needed but required by ActivityEventListener
    }

    companion object {
        private const val MEDIA_PROJECTION_REQUEST_CODE = 1000
    }
}
