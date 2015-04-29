$(document).ready(function() {
    $('form#card-delete').submit(function(event) {
        event.preventDefault();
        $.ajax({
            url: $(this).attr('action'),
            data: $(this).serialize(),
            type: 'DELETE'
        }).done(function(res) {
            console.log(res);
            if (res.err) {
                showNotification(res.msg, 'error');
                $('#card-id').focus();
            } else {
                showNotification('Operation Success', 'success');
                $('form#card-delete')[0].reset();
                $('#card-id').focus();
            }
        });
    });
});