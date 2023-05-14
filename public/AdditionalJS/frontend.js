document.querySelector('.wdr69gjvbutton').addEventListener('click', function() {
    fetch('/fetch-data')
        .then(response => response.json())
        .then(data => {
            console.log("Data received:", data);
            document.querySelector('.wdr69gjvtextfield').innerText = data.myValue;
        })
        .catch(error => {
            console.error("Error:", error);
        });
});