package expo.modules.ffmpeg

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import com.arthenica.ffmpegkit.FFmpegKit
import com.arthenica.ffmpegkit.ReturnCode

class FfmpegModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("FfmpegModule")

    Events("onProgress", "onLog")

    AsyncFunction("executeAsync") { command: String, outputPath: String, promise: expo.modules.kotlin.Promise ->
      
      FFmpegKit.executeAsync(
        command,
        { session ->
          if (ReturnCode.isSuccess(session.returnCode)) {
            promise.resolve(outputPath)
          } else if (ReturnCode.isCancel(session.returnCode)) {
            promise.reject("CANCELLED", "Processing cancelled", null)
          } else {
            val logs = session.allLogsAsString ?: "No logs"
            promise.reject("FAILED", "FFmpeg failed.\nLogs:\n$logs", null)
          }
        },
        { log -> 
          // Send log to JS so we can see it in Metro!
          sendEvent("onLog", mapOf("message" to log.message))
        },
        { statistics -> 
          sendEvent("onProgress", mapOf("time" to statistics.time))
        }
      )
    }
  }
}