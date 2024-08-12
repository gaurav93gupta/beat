const video = document.getElementById('video');
        const messageElement = document.getElementById('message');
        let qrCodeData = null;

        // Set up the video stream for QR code scanning
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(stream => {
                video.srcObject = stream;
                scanQRCode(stream);
            })
            .catch(error => {
                console.error('Error accessing camera:', error);
                showError('Error accessing camera. Please check your camera settings.');
            });

        function scanQRCode(stream) {
            const scanInterval = setInterval(() => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

                if (qrCode) {
                    qrCodeData = qrCode.data;
                    clearInterval(scanInterval);
                    stopVideoStream(stream);
                    captureGeolocation();
                }
            }, 500); // Scan every 500ms
        }

        function captureGeolocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    console.log(`Geolocation: ${lat}, ${lon}`);

                    sendDataToGoogleForm(qrCodeData, lat, lon);
                }, error => {
                    console.error('Geolocation error:', error);
                    showError('Error capturing geolocation. Please check your location settings.');
                });
            } else {
                showError('Geolocation not supported by this browser.');
            }
        }

        function sendDataToGoogleForm(qrCode, lat, lon) {
            const formData = new FormData();
            formData.append('entry.249039596', qrCode); // Replace with your Google Form field entry ID
            formData.append('entry.1178523919', `${lat},${lon}`); // Replace with your Google Form field entry ID

            fetch('https://docs.google.com/forms/d/e/1FAIpQLSfEocOK_6srnw0S5W5CNghPVplcGtBngoPlFNzd4r8D42TEXg/formResponse?', {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            }).then(() => {
                messageElement.textContent = 'Completed successfully!';
            }).catch(error => {
                console.error('Error submitting data', error);
                showError('Error submitting data. Please try again.');
            });
        }

        function stopVideoStream(stream) {
            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
        }

        function showError(message) {
            messageElement.innerHTML = `<span id="error-message">${message}</span>`;
        }


     