// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {

  // jstree conditional select node
  (function ($, undefined) {
    "use strict";
    $.jstree.defaults.conditionalselect = function () { return true; };

    $.jstree.plugins.conditionalselect = function (options, parent) {
      // own function
      this.select_node = function (obj, supress_event, prevent_open) {
        if (this.settings.conditionalselect.call(this, this.get_node(obj))) {
          parent.select_node.call(this, obj, supress_event, prevent_open);
        }
      };
    };
  })(jQuery);

  $.fn.dropDownTreeView = function (options) {

    options = options || {};
    var defaultOptions = {
      autoClose: false,
      selectedValue: "",
      url: "#",
      dummyText: "Select an item",
      searchPlaceHolderText: "Search...",
      onItemSelected: null,
      showRemoveButton: true,
      removeButtonText: "Remove selection",
      data: null
    };

    var newOptions = $.extend({}, defaultOptions, options);

    var $this = $(this);
    $this.addClass("dropdown dropdown-treeview");
    $this.html(getInnerHtml(newOptions))

    makeDropDownTreeView($this, newOptions)
  }


  function makeDropDownTreeView($jsTreeContainer, options) {

    var $jsTree = $jsTreeContainer.find(".dropdown-treeview-jstree")
    var $jsTreeSearch = $jsTreeContainer.find(".dropdown-treeview-search");
    var $dropdownMenuButton = $jsTreeContainer.find(".dropdown-treeview-button");

    $dropdownMenuButton.text(options.dummyText);
    $jsTreeSearch.attr("placeholder", options.searchPlaceHolderText);

    $jsTreeContainer.attr("data-selected-value", options.selectedValue);

    var to = false;

    $jsTreeContainer.find(".dropdown-menu").on("click", function (e) {
      e.stopPropagation();
    })

    $jsTreeContainer.find(".dropdown-treeview-remove").on("click", function (e) {
      e.stopPropagation();
      $jsTree.jstree('activate_node', "");
      setNodeValues({ id: "", text: options.dummyText });
    })

    $jsTreeSearch.keyup(function () {
      if (to) { clearTimeout(to); }
      to = setTimeout(function () {
        $jsTree.jstree(true).show_all();
        var v = $jsTreeSearch.val();
        $jsTree.jstree(true).search(v);
      }, 250);
    });

    var data = {
      'cache': false,
      'url': function (node) {
        return options.url;
      },
      'data': function (node) {
        return { 'id': node.id };
      }
    };
    
    if (options.data) {
      data = options.data;
    }


    var tree = $jsTree.jstree({
      "core": {
        "animation": 0,
        "check_callback": true,
        'force_text': true,
        "themes": { "stripes": true },
        "multiple": false,
        'data': data
      },
      "types": {
        "folder": {},
        "file": { "icon": false }
      },
      'search': {
        'case_insensitive': true,
        'show_only_matches': true
      },
      'conditionalselect': function (node) {
        return node.type == "file" ? true : false;
      },
      "plugins": ["search", "types", "conditionalselect"]
    });

    tree.on('search.jstree', function (nodes, str, res) {
      if (str.nodes.length === 0) {
        $jsTree.jstree(true).hide_all();
      }
    });

    tree.on('loaded.jstree', function () {
      $jsTree.jstree('close_all');
      $jsTree.jstree('activate_node', options.selectedValue)
    });

    // listen for event
    tree.on('changed.jstree', function (e, data) {
      var node = data.instance.get_node(data.selected[0]);
      setNodeValues(node);
    });

    function setNodeValues(node) {

      if (node) {

        $jsTreeContainer.attr("data-selected-value", node.id);

        options.selectedValue = node.id;
        if (options.onItemSelected) {
          options.onItemSelected(node);
        }
        $dropdownMenuButton.text(node.text);
        if (options.autoClose) {
          $dropdownMenuButton.click();
        }
      }
    }
  }

  function getInnerHtml(options) {
    var html = '<button class="btn btn-sm btn-secondary dropdown-toggle dropdown-treeview-button" type="button"' +
      ' data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
      ' Select an item' +
      ' </button>' +
      ' <div class="dropdown-menu p-1" >' +
      '   <div>' +
      '  <table class="w-100">' +
      '  <tr>' +
      '    <td>' +
      '      <input type="text" value="" class="form-control input-sm p-1 m-0 h-auto dropdown-treeview-search"' +
      '        placeholder="Search">' +
      '    </td>';


    if (options.showRemoveButton) {
      html += '    <td class="p-1">' +
        '      <span title="' + options.removeButtonText + '" class="dropdown-treeview-remove" style="cursor: pointer;">x</span>' +
        '     </td>';
    }


    html += '   </tr>' +
      ' </table>' +
      '    <div class="dropdown-treeview-jstree"></div>' +
      '   </div>' +
      ' </div>';
    return html;
  }
}())
