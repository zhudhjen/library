var showNotification = function(text) {
    if (window.cd) {
        clearTimeout(window.cd);
    }
    $('#login-notify').text(text).css('opacity', 1);
    window.cd = setTimeout(function() {
        $('#login-notify').text('').css('opacity', 0);
    }, 10000);
};

$(document).ready(function() {
    $('form[name=login]').submit(function(event) {
        event.preventDefault();
        $.post($(this).attr('action'), $(this).serialize())
        .done(function(res) {
            console.log(res);
            if (res.err) {            
                showNotification(res);
                $('#password').val('');
            } else {
                window.location = res.url;
            }
        });
    });
});