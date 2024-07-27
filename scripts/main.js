require.config({
    paths: {
        'text': 'https://cdnjs.cloudflare.com/ajax/libs/require-text/2.0.12/text.min'
    }
});

require(['scripts/index.js'], function (index) {
    document.getElementById('routeButton').addEventListener('click', function() {
        index.getAddressesAndConvertToCoords();
    });
});