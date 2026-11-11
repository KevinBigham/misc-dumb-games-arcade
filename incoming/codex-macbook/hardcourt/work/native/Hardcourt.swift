import AppKit
import WebKit
import UniformTypeIdentifiers

@MainActor
final class AppDelegate: NSObject, NSApplicationDelegate, WKUIDelegate, WKScriptMessageHandler, NSWindowDelegate {
    var window: NSWindow!
    var webView: WKWebView!

    func applicationDidFinishLaunching(_ notification: Notification) {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.userContentController.add(self, name: "hardcourt")
        webView = WKWebView(frame: .zero, configuration: configuration)
        webView.uiDelegate = self
        webView.underPageBackgroundColor = NSColor(red: 0.063, green: 0.086, blue: 0.078, alpha: 1)

        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1440, height: 940), styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "HARDCOURT — Franchise Basketball"
        window.minSize = NSSize(width: 900, height: 650)
        window.contentView = webView
        window.delegate = self
        window.setFrameAutosaveName("HardcourtMainWindow")
        window.center()
        createMenus()
        let file = Bundle.main.url(forResource: "Hardcourt", withExtension: "html")!
        webView.loadFileURL(file, allowingReadAccessTo: file.deletingLastPathComponent())
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func createMenus() {
        let bar = NSMenu()
        let appItem = NSMenuItem()
        let appMenu = NSMenu()
        appMenu.addItem(withTitle: "About Hardcourt", action: #selector(about), keyEquivalent: "")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Hide Hardcourt", action: #selector(NSApplication.hide(_:)), keyEquivalent: "h")
        appMenu.addItem(.separator())
        appMenu.addItem(withTitle: "Quit Hardcourt", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        appItem.submenu = appMenu
        bar.addItem(appItem)

        let careerItem = NSMenuItem()
        let careerMenu = NSMenu(title: "Career")
        careerMenu.addItem(withTitle: "Save Career", action: #selector(saveCareer), keyEquivalent: "s")
        careerMenu.addItem(withTitle: "Export Career…", action: #selector(exportCareer), keyEquivalent: "e")
        careerMenu.addItem(withTitle: "Import Career…", action: #selector(importCareer), keyEquivalent: "o")
        careerMenu.addItem(.separator())
        careerMenu.addItem(withTitle: "Career Selection", action: #selector(careerSelection), keyEquivalent: "n")
        careerItem.submenu = careerMenu
        bar.addItem(careerItem)

        let editItem = NSMenuItem()
        let editMenu = NSMenu(title: "Edit")
        for (title, action, key) in [("Undo", "undo:", "z"), ("Cut", "cut:", "x"), ("Copy", "copy:", "c"), ("Paste", "paste:", "v"), ("Select All", "selectAll:", "a")] {
            editMenu.addItem(withTitle: title, action: Selector(action), keyEquivalent: key)
        }
        editItem.submenu = editMenu
        bar.addItem(editItem)

        let viewItem = NSMenuItem()
        let viewMenu = NSMenu(title: "View")
        let fullScreen = viewMenu.addItem(withTitle: "Enter Full Screen", action: #selector(NSWindow.toggleFullScreen(_:)), keyEquivalent: "f")
        fullScreen.keyEquivalentModifierMask = [.command, .control]
        viewItem.submenu = viewMenu
        bar.addItem(viewItem)

        let helpItem = NSMenuItem()
        let helpMenu = NSMenu(title: "Help")
        helpMenu.addItem(withTitle: "Franchise Playbook", action: #selector(playbook), keyEquivalent: "?")
        helpItem.submenu = helpMenu
        bar.addItem(helpItem)
        NSApp.mainMenu = bar
    }

    @objc func about() {
        NSApp.orderFrontStandardAboutPanel(options: [.applicationName: "HARDCOURT", .applicationVersion: "1.0", .credits: NSAttributedString(string: "Franchise Basketball\nAn original offline basketball management game.\nBuilt for Kevin · November 2026")])
    }
    @objc func saveCareer() { webView.evaluateJavaScript("window.HardcourtNative.save()") }
    @objc func exportCareer() { webView.evaluateJavaScript("window.HardcourtNative.exportCareer()") }
    @objc func importCareer() { webView.evaluateJavaScript("window.HardcourtNative.importCareer()") }
    @objc func careerSelection() { webView.evaluateJavaScript("window.HardcourtNative.title()") }
    @objc func playbook() { webView.evaluateJavaScript("window.HardcourtNative.help()") }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let data = message.body as? [String: String], data["type"] == "export", let content = data["content"], let filename = data["filename"] else { return }
        let panel = NSSavePanel()
        panel.title = "Export Hardcourt Career"
        panel.nameFieldStringValue = filename
        panel.allowedContentTypes = [.json]
        panel.canCreateDirectories = true
        panel.beginSheetModal(for: window) { response in
            guard response == .OK, let url = panel.url else {
                self.webView.evaluateJavaScript("window.HardcourtNative.exportResult('cancelled')")
                return
            }
            do {
                try content.write(to: url, atomically: true, encoding: .utf8)
                self.webView.evaluateJavaScript("window.HardcourtNative.exportResult('saved')")
            } catch {
                self.webView.evaluateJavaScript("window.HardcourtNative.exportResult('error')")
            }
        }
    }

    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping (Bool) -> Void) {
        let alert = NSAlert()
        alert.messageText = "Hardcourt Career"
        alert.informativeText = message
        alert.addButton(withTitle: "Continue")
        alert.addButton(withTitle: "Cancel")
        alert.beginSheetModal(for: window) { completionHandler($0 == .alertFirstButtonReturn) }
    }

    func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping ([URL]?) -> Void) {
        let panel = NSOpenPanel()
        panel.title = "Import Hardcourt Career"
        panel.allowedContentTypes = [.json]
        panel.allowsMultipleSelection = false
        panel.canChooseDirectories = false
        panel.beginSheetModal(for: window) { response in completionHandler(response == .OK ? panel.urls : nil) }
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
    func windowShouldClose(_ sender: NSWindow) -> Bool {
        webView.evaluateJavaScript("window.HardcourtNative.save()")
        return true
    }
    func applicationShouldTerminate(_ sender: NSApplication) -> NSApplication.TerminateReply {
        webView.evaluateJavaScript("window.HardcourtNative.save()") { _, _ in NSApp.reply(toApplicationShouldTerminate: true) }
        return .terminateLater
    }
}

@main
struct HardcourtApplication {
    @MainActor
    static func main() {
        let application = NSApplication.shared
        let delegate = AppDelegate()
        application.delegate = delegate
        application.setActivationPolicy(.regular)
        withExtendedLifetime(delegate) { application.run() }
    }
}
