import UIKit
import Capacitor

/// Resolves paths to the Next.js static export (`trailingSlash: true`).
///
/// Capacitor's default router serves the root index.html for every path
/// without a file extension (an SPA assumption). A Next.js export has one
/// HTML file per route, so a full page load of /sessions must serve
/// sessions/index.html — otherwise it shows the home page at the wrong URL.
struct NextExportRouter: Router {
    var basePath: String = ""

    func route(for path: String) -> String {
        // Files with an extension (JS, CSS, images, RSC .txt payloads) load as-is.
        if !URL(fileURLWithPath: path).pathExtension.isEmpty {
            return basePath + path
        }
        let fm = FileManager.default
        let trimmed = path.hasSuffix("/") ? String(path.dropLast()) : path
        let dirIndex = basePath + trimmed + "/index.html"
        if fm.fileExists(atPath: dirIndex) { return dirIndex }
        if !trimmed.isEmpty {
            let flatHtml = basePath + trimmed + ".html"
            if fm.fileExists(atPath: flatHtml) { return flatHtml }
        }
        let notFound = basePath + "/404.html"
        if fm.fileExists(atPath: notFound) { return notFound }
        return basePath + "/index.html"
    }
}

/// The app's root view controller (set in Base.lproj/Main.storyboard).
class AppViewController: CAPBridgeViewController {
    override func router() -> Router {
        return NextExportRouter()
    }
}
