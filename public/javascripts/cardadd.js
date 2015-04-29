$(document).ready(function() {
    $('form#card-add').submit(function(event) {
        event.preventDefault();
        $.post($(this).attr('action'), $(this).serialize())
        .done(function(res) {
            console.log(res);
            if (res.err) {
                showNotification(res.msg, 'error');
                $('#card-id').focus();
            } else {
                showNotification('Operation Success', 'success');
                $('form#card-add')[0].reset();
                $('#card-id').focus();
            }
        });
    });
});