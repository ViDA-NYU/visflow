/**
 * @fileoverview Fixed top menu (navbar) for VisFlow.
 */

/** @const */
visflow.menu = {};

/** @private @const {number} */
visflow.menu.TOOLTIP_DELAY_ = 1000;

/** @private @const {string} */
visflow.menu.NAVBAR_SELECTOR_ = '.visflow > .navbar-fixed-top';

/**
 * Initializes the menu.
 */
visflow.menu.init = function() {
  var navbar = $(visflow.menu.NAVBAR_SELECTOR_);
  visflow.menu.initTaskDropdown_();
  visflow.menu.initDiagramDropdown_();
  visflow.edit.initDropdown(navbar);
  visflow.view.initDropdown(navbar);
  visflow.menu.initHelpDropdown_();
  visflow.menu.initUserButtons_();
  visflow.menu.initTooltips_();

  visflow.menu.initEventListeners_();
};

/**
 * Initializes D3M d3m dropdown.
 * @private
 */
visflow.menu.initTaskDropdown_ = function() {
  var task = $(visflow.menu.NAVBAR_SELECTOR_).find('#task');
  task.find('#new').click(visflow.d3m.newTask);
  task.find('#new-config').click(visflow.d3m.newTaskFromConfig);
  task.find('#exit').click(visflow.d3m.exit);
};

/**
 * Initializes diagram dropdown.
 * @private
 */
visflow.menu.initDiagramDropdown_ = function() {
  var diagram = $(visflow.menu.NAVBAR_SELECTOR_).find('#diagram');
  diagram.find('#new').click(function() {
    visflow.diagram.new();
  });
  diagram.find('#save').click(function() {
    visflow.diagram.save();
  });
  diagram.find('#load').click(function() {
    visflow.diagram.load();
  });

  visflow.listen(visflow.options, visflow.Event.DIAGRAM_EDITABLE,
    function() {
      diagram.find('#save')
        .toggleClass('disabled', !visflow.options.isDiagramSavable());
    });
};

/**
 * Initializes help dropdown.
 * @private
 */
visflow.menu.initHelpDropdown_ = function() {
  var help = $(visflow.menu.NAVBAR_SELECTOR_).find('#help');
  help.find('#documentation').click(function() {
    visflow.documentation();
  });
  help.find('#about').click(function() {
    visflow.about();
  });
};

/**
 * Initializes user registration and login menu items.
 * @private
 */
visflow.menu.initUserButtons_ = function() {
  var navbar = $(visflow.menu.NAVBAR_SELECTOR_);
  var register = navbar.find('#register');
  register.click(function() {
    visflow.user.register();
  });
  var login = navbar.find('#login');
  login.click(function() {
    visflow.user.login();
  });
  var logout = navbar.find('#logout');
  logout.click(function() {
    visflow.user.logout();
  });
  var username = navbar.find('#username');
  username.click(function() {
    visflow.user.profile();
  });
};

/**
 * Initializes menu tooltips.
 * @private
 */
visflow.menu.initTooltips_ = function() {
  $(visflow.menu.NAVBAR_SELECTOR_).find('.to-tooltip').tooltip({
    delay: visflow.menu.TOOLTIP_DELAY_
  });
};

/**
 * Initializes the update event handlers for events across systems.
 * @private
 */
visflow.menu.initEventListeners_ = function() {
  var navbar = $('.visflow > .navbar-fixed-top');
  visflow.listenMany(visflow.user, [
    {
      event: visflow.Event.LOGIN,
      callback: function() {
        navbar.find('.logged-in').show();
        navbar.find('.logged-out').hide();
        navbar.find('#username').text(visflow.user.account.username);

        navbar.find('#diagram #save')
          .toggleClass('disabled', !visflow.options.isDiagramSavable());
        navbar.find('#load').removeClass('disabled');
      }
    },
    {
      event: visflow.Event.LOGOUT,
      callback: function() {
        navbar.find('.logged-out').show();
        navbar.find('.logged-in').hide();

        navbar.find('#save, #load').addClass('disabled');
      }
    }
  ]);


  visflow.listen(visflow.options, visflow.Event.DIAGRAM_EDITABLE,
    visflow.menu.diagramEditableChanged_);
};

/**
 * Updates the enabled/disabled state of the add node item in the menu.
 * @private
 */
visflow.menu.diagramEditableChanged_ = function() {
  var navbar = $('.visflow > .navbar-fixed-top');

  var addNode = navbar.find('#add-node');
  addNode.toggleClass('disabled', !visflow.options.isDiagramEditable());
};
