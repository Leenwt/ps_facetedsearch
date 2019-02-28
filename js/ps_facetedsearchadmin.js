function checkForm() {
  var is_category_selected = false;
  var is_filter_selected   = false;

  $('#categories-treeview input[type=checkbox]').each(function() {
    if ($(this).prop('checked')) {
      is_category_selected = true;
      return false;
    }
  });

  $('.filter_list_item input[type=checkbox]').each(function() {
    if ($(this).prop('checked')) {
      is_filter_selected = true;
      return false;
    }
  });

  if (!is_category_selected) {
    alert(translations['no_selected_categories']);
    $('#categories-treeview input[type=checkbox]').first().focus();
    return false;
  }

  if (!is_filter_selected) {
    alert(translations['no_selected_filters']);
    $('#filter_list_item input[type=checkbox]').first().focus();
    return false;
  }

  return true;
}

$(document).ready(function() {
  console.log('here');
  $('.ajaxcall').click(function() {
    if (this.legend == undefined) {
      this.legend = $(this).html();
    }

    if (this.running == undefined) {
      this.running = false;
    }

    if (this.running == true) {
      return false;
    }

    $('.ajax-message').hide();
    this.running = true;

    if (typeof(this.restartAllowed) == 'undefined' || this.restartAllowed) {
      $(this).html(this.legend + translations['in_progress']);
      $('#indexing-warning').show();
    }

    this.restartAllowed = false;
    var type = $(this).attr('rel');

    $.ajax({
      url: this.href+'&ajax=1',
      context: this,
      dataType: 'json',
      cache: 'false',
      success: function(res) {
        this.running = false;
        this.restartAllowed = true;
        $('#indexing-warning').hide();
        $(this).html(this.legend);

        $('#ajax-message-ok span').html(
          type === 'price' ?
          translations['url_indexation_finished'] :
          translations['attribute_indexation_finished']
        );

        $('#ajax-message-ok').show();
      },
      error: function(res) {
        this.restartAllowed = true;
        $('#indexing-warning').hide();

        $('#ajax-message-ko span').html(
          type === 'price' ?
          translations['url_indexation_failed'] :
          translations['attribute_indexation_failed']
        );

        $('#ajax-message-ko').show();
        $(this).html(this.legend);
        this.running = false;
      }
    });

    return false;
  });

  $('.ajaxcall-recurcive').each(function(it, elm) {
    $(elm).click(
      function() {
        if (this.cursor == undefined) {
          this.cursor = 0;
        }

        if (this.legend == undefined) {
          this.legend = $(this).html();
        }

        if (this.running == undefined) {
          this.running = false;
        }

        if (this.running == true) {
          return false;
        }

        $('.ajax-message').hide();

        this.running = true;

        if (typeof(this.restartAllowed) == 'undefined' || this.restartAllowed) {
          $(this).html(this.legend+translations['in_progress']);
          $('#indexing-warning').show();
        }

        this.restartAllowed = false;

        $.ajax({
          url: this.href+'&ajax=1&cursor=' + this.cursor,
          context: this,
          dataType: 'json',
          cache: 'false',
          success: function(res) {
            this.running = false;
            if (res.result) {
              this.cursor = 0;
              $('#indexing-warning').hide();
              $(this).html(this.legend);
              $('#ajax-message-ok span').html(translations['price_indexation_finished']);
              $('#ajax-message-ok').show();
              return;
            }

            this.cursor = parseInt(res.cursor);
            $(this).html(this.legend+translations['price_indexation_in_progress'].replace('%s', res.count));
            $(this).click();
          },
          error: function(res) {
            this.restartAllowed = true;
            $('#indexing-warning').hide();
            $('#ajax-message-ko span').html(translations['price_indexation_failed']);
            $('#ajax-message-ko').show();
            $(this).html(this.legend);

            this.cursor = 0;
            this.running = false;
          }
        });
        return false;
      });
  });

  if (typeof PS_LAYERED_INDEXED !== 'undefined' && PS_LAYERED_INDEXED) {
    $('#url-indexe').click();
    $('#full-index').click();
  }

  $('.sortable').sortable({
    forcePlaceholderSize: true
  });

  $('.filter_list_item input[type=checkbox]').click(function() {
    var current_selected_filters_count = parseInt($('#selected_filters').html());

    $('#selected_filters').html(
      $(this).prop('checked') ?
      current_selected_filters_count+1 :
      current_selected_filters_count-1
    );
  });


  if (typeof filters !== 'undefined') {
    filters = JSON.parse(filters);
    var container = null;
    var $el;
    for (filter in filters) {
      $el = $('#'+filter);
      $el.prop('checked', true);
      $('#selected_filters').html(parseInt($('#selected_filters').html())+1);
      $('select[name="'+filter+'_filter_type"]').val(filters[filter].filter_type);
      $('select[name="'+filter+'_filter_show_limit"]').val(filters[filter].filter_show_limit);
      if (container === null) {
        container = $('#'+filter).closest('ul');
        $el.closest('li').detach().prependTo(container);
      } else {
        $el.closest('li').detach().insertAfter(container);
      }

      container = $el.closest('li');
    }
  }
});
