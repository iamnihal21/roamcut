package com.arthenica.smartexception.java

import java.io.PrintWriter
import java.io.StringWriter

/**
 * Shim for com.arthenica.smart-exception-java which was deleted from Maven Central.
 * This class provides the minimal API that FFmpegKit AAR expects.
 */
class Exceptions {
    companion object {
        @JvmStatic
        fun registerRootPackage(packageName: String) {
            // No-op shim, we don't need to track package names
        }

        @JvmStatic
        fun getRootCause(throwable: Throwable?): Throwable? {
            var cause = throwable
            while (cause?.cause != null) {
                cause = cause.cause
            }
            return cause
        }

        @JvmStatic
        fun getStackTraceString(throwable: Throwable?): String {
            if (throwable == null) return ""
            val sw = StringWriter()
            val pw = PrintWriter(sw)
            throwable.printStackTrace(pw)
            return sw.toString()
        }
    }
}