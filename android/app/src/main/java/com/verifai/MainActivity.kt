package com.verifai

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Build
import android.os.Bundle
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.widget.Toast
import android.util.Log
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import android.Manifest
import androidx.core.content.ContextCompat
import androidx.core.app.ActivityCompat
import android.content.pm.PackageManager
import com.zoontek.rnbootsplash.RNBootSplash
import android.os.Handler
import android.os.Looper


class MainActivity : ReactActivity() {

    private lateinit var overlayPermissionLauncher: ActivityResultLauncher<Intent>

    override fun onCreate(savedInstanceState: Bundle?) {
        RNBootSplash.init(this, R.style.BootTheme)
        super.onCreate(savedInstanceState)
        Log.d("MainActivity", "onCreate called")

        // Register launcher for overlay permission
        overlayPermissionLauncher = registerForActivityResult(
            ActivityResultContracts.StartActivityForResult()
        ) { result ->
            if (Settings.canDrawOverlays(this)) {
                Log.d("MainActivity", "Overlay permission granted")
            } else {
                Log.e("MainActivity", "Overlay permission denied.")
                Toast.makeText(this, "Overlay permission required", Toast.LENGTH_SHORT).show()
            }
        }

        // Defer overlay permission request to avoid blocking app initialization
        // Post to the main thread handler to run after the app has loaded
        Handler(Looper.getMainLooper()).postDelayed({
            // Check overlay permission after app has initialized
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(this)) {
                Log.d("MainActivity", "Requesting overlay permission...")
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:$packageName")
                )
                Toast.makeText(this, "Please grant overlay permission", Toast.LENGTH_LONG).show()
                overlayPermissionLauncher.launch(intent)
            }
        }, 1000) // Wait 1 second after app loads
    }

    override fun getMainComponentName(): String = "verifai"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
