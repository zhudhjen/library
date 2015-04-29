var showNotification = function(text, type) {
    if (window.cd) {
        $('#notification').removeClass('error').removeClass('success');
        clearTimeout(window.cd);
    }
    $('#notification').text(text).addClass(type);
    window.cd = setTimeout(function() {
        $('#notification').text('').removeClass(type);
    }, 10000);
};