jQuery(function($){
    $('#me').on('click', function(){
        $('#myMenu').toggleClass('open');
    });

    $(document).click(function(e){
        var _me = $('#me');
        if(!_me.is(e.target) && _me.has(e.target).length === 0){
            $('#myMenu').removeClass('open');
        }
    });
});