// Module to handle URL loading logic
var urlLoader = (function() {

    var PERMISSIONS = {
        CAMERA: kony.os.PERMISSION_CAMERA,
        MICROPHONE: kony.os.PERMISSION_MICROPHONE, // Note: Kony specific permission for microphone might vary or be part of others
        LOCATION: kony.os.PERMISSION_ACCESS_FINE_LOCATION
    };

    var permissionMessages = {
        [kony.os.PERMISSION_CAMERA]: "Camera access is required to display video.",
        [kony.os.PERMISSION_MICROPHONE]: "Microphone access is required for audio in videos.",
        [kony.os.PERMISSION_ACCESS_FINE_LOCATION]: "Location access is required for location services."
    };

    var urlToLoad = "";

    // Function to actually load the URL into the browser
    function proceedToLoadURL() {
        if (urlToLoad === null || urlToLoad.trim() === "") {
            alert("URL is empty. Cannot load.");
            return;
        }

        kony.print("Loading URL: " + urlToLoad);

        frmMain.browserMain.requestURLConfig = {
            "URL": urlToLoad,
            "requestMethod": constants.BROWSER_REQUEST_METHOD_GET
        };

        // Hide input elements and show browser
        frmMain.txtURL.isVisible = false;
        frmMain.btnLoadURL.isVisible = false;
        frmMain.browserMain.isVisible = true;
        frmMain.browserMain.height = "100%";
        frmMain.forceLayout();
    }

    // Callback for permission request
    function permissionCallback(permission, isGranted) {
        kony.print("Permission: " + permission + ", Granted: " + isGranted);
        if (isGranted) {
            // If current permission granted, try to request the next one or proceed
            checkAndRequestPermissions();
        } else {
            alert("Permission Denied: " + (permissionMessages[permission] || "A required permission was denied."));
            // Optionally, guide user to settings: kony.application.openApplicationSettings();
            resetToInputView();
        }
    }

    function resetToInputView() {
        frmMain.txtURL.isVisible = true;
        frmMain.btnLoadURL.isVisible = true;
        frmMain.browserMain.isVisible = false;
        frmMain.forceLayout();
    }

    // Check and request permissions sequentially
    function checkAndRequestPermissions() {
        var permissionsToRequest = [];
        if (kony.os.getDeviceCurrentOrientation() !== undefined) { // Simple check for mobile platform
             // Camera
            if (kony.application.checkPermission(PERMISSIONS.CAMERA).status !== kony.application.PERMISSION_GRANTED) {
                permissionsToRequest.push(PERMISSIONS.CAMERA);
            }
            // Microphone - Kony's specific microphone permission might be tricky.
            // Often RECORD_AUDIO on Android covers it. For iOS, it's a separate Info.plist key.
            // Using a placeholder if PERMISSION_MICROPHONE isn't universally defined or if it's implicitly covered.
            // For this example, we assume kony.os.PERMISSION_MICROPHONE exists and is relevant.
            // If not, one might need platform-specific handling or rely on Camera permission for audio capture.
            // Let's assume it's distinct for now for demo purposes.
            if (PERMISSIONS.MICROPHONE && kony.application.checkPermission(PERMISSIONS.MICROPHONE).status !== kony.application.PERMISSION_GRANTED) {
                 if (!permissionsToRequest.includes(PERMISSIONS.MICROPHONE)) permissionsToRequest.push(PERMISSIONS.MICROPHONE);
            } else if (!PERMISSIONS.MICROPHONE) {
                kony.print("Microphone permission constant not found, skipping explicit request. Ensure it's bundled with Camera or handled by OS.");
            }

            // Location
            if (kony.application.checkPermission(PERMISSIONS.LOCATION).status !== kony.application.PERMISSION_GRANTED) {
                if (!permissionsToRequest.includes(PERMISSIONS.LOCATION)) permissionsToRequest.push(PERMISSIONS.LOCATION);
            }
        }


        if (permissionsToRequest.length > 0) {
            var nextPermission = permissionsToRequest[0];
            kony.print("Requesting permission for: " + nextPermission);
            kony.application.requestPermission(nextPermission, function(response) {
                permissionCallback(nextPermission, response.status === kony.application.PERMISSION_GRANTED);
            });
        } else {
            kony.print("All necessary permissions are already granted.");
            proceedToLoadURL();
        }
    }

    // Entry point function, called on button click
    function initiateLoadURL() {
        var rawURL = frmMain.txtURL.text;

        if (rawURL === null || rawURL.trim() === "") {
            alert("Please enter a URL.");
            return;
        }

        if (!rawURL.startsWith("http://") && !rawURL.startsWith("https://")) {
            urlToLoad = "http://" + rawURL;
        } else {
            urlToLoad = rawURL;
        }

        // Start permission check flow
        checkAndRequestPermissions();
    }

    return {
        loadURL: initiateLoadURL // Expose the new entry point
    };

})();
