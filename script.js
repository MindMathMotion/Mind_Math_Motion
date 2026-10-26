
 // Register service worker
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .then(() => {
                console.log("Service worker registered");
            })
            .catch(error => {
                console.error("Service worker error:", error);
            });
    });
}




function copyContact(buttonId, value) {
    const button = document.getElementById(buttonId);
    const originalText = button.textContent.trim();

    button.addEventListener("click", async function() {
        try {
            await navigator.clipboard.writeText(value);
            this.textContent = "Copied!";

            setTimeout(() => {
                this.textContent = originalText;
            }, 1000);

        } catch (error) {
            this.textContent = "Copy Failed";
        }
    });
}

copyContact("copyPhone", "6047886814");
copyContact("copyEmail", "math.mind.motion@gmail.com");

let deferredInstallPrompt;

const installButton = document.getElementById("installApp");

window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton.hidden = false;
});

installButton.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;

    deferredInstallPrompt = null;
    installButton.hidden = true;
});

window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    deferredInstallPrompt = null;
});