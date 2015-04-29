$(document).ready(function() {
    $('form#record').submit(function(event) {
        event.preventDefault();
        $.get($(this).attr('action'), $(this).serialize())
        .done(function(res) {
            if (res.err) {
                console.log(res);
                showNotification(res.msg, 'error');
            } else {
                showNotification('Query Success', 'success');
                $('.result-count').text(res.result.length + ' entries found');
                $('tbody').empty();
                $.each(res.result, function(index, value) {
                    var tr = $('<tr></tr>');
                    $('<td></td>').text(value.book_id).appendTo(tr);
                    $('<td></td>').text(value.category).appendTo(tr);
                    $('<td></td>').text(value.title).appendTo(tr);
                    $('<td></td>').text(value.press).appendTo(tr);
                    $('<td></td>').text(value.author).appendTo(tr);
                    $('<td></td>').text(value.year).appendTo(tr);
                    $('<td></td>').text(value.price).appendTo(tr);
                    $('<td></td>').text(value.remain_quantity + ' / ' + value.total_quantity).appendTo(tr);
                    $('<td></td>').text(value.remain_time).appendTo(tr);
                    // $('<td></td>').text(value.borrow_date).appendTo(tr);
                    // $('<td></td>').text(value.return_date).appendTo(tr);
                    tr.appendTo($('tbody'));
                });
                $('#results').css('display', 'block');
            }
        });
    });
});