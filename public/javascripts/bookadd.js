$(document).ready(function() {
    $('form#book-add').submit(function(event) {
        event.preventDefault();
        $.post($(this).attr('action'), $(this).serialize())
        .done(function(res) {
            console.log(res);
            if (res.err) {
                showNotification(res.msg, 'error');
                $('#book-id').focus();
            } else {
                showNotification('Operation Success', 'success');
                $('form#book-add')[0].reset();
                $('#book-id').focus();
            }
        });
    });
});