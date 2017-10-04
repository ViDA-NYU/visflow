/**
 * @fileoverview Visflow welcome page.
 */

/** @const */
visflow.welcome = {};

/** @private @const {string} */
visflow.welcome.TEMPLATE_ = './dist/html/welcome/welcome.html';


/**
 * Launches the system welcome.
 */
visflow.welcome.init = function() {
  if (!visflow.user.loggedIn() || visflow.isMobile()) {
    visflow.dialog.create({
      template: visflow.welcome.TEMPLATE_,
      complete: visflow.welcome.initWelcome_
    });
  }
};


/**
 * Initializes the welcome dialog.
 * @param {!jQuery} dialog
 * @private
 */
visflow.welcome.initWelcome_ = function(dialog) {
  dialog.find('#is-mobile').toggle(visflow.isMobile());

  dialog.find('#instruction')
    .click(d3m.instruction);
  dialog.find('#start')
    .click(visflow.user.loginDemo);

  dialog.find('#get-started')
    .click(visflow.documentation);
  dialog.find('#create-account')
    .click(visflow.user.register);
  dialog.find('#sign-in')
    .click(visflow.user.login);
  dialog.find('#try-demo')
    .click(visflow.user.loginDemo);
};
