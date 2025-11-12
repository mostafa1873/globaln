document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const form = e.target;
    const formData = new FormData(form);
    const messageDiv = document.getElementById('form-message');

    fetch(form.action, {
        method: form.method,
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        if(result.trim() === 'success') {
            messageDiv.style.color = '#007bff';
            messageDiv.textContent = 'تم إرسال الرسالة بنجاح!';
            form.reset();
        } else {
            messageDiv.style.color = 'red';
            messageDiv.textContent = 'حدث خطأ، يرجى المحاولة مرة أخرى.';
        }
    })
    .catch(err => {
        messageDiv.style.color = 'red';
        messageDiv.textContent = 'حدث خطأ، يرجى المحاولة مرة أخرى.';
        console.error(err);
    });
});