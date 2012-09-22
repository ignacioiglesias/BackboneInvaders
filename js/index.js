// **Author:** [Juan Ignacio Iglesias](mailto://ignacio@bandofcoders.com)
(function ($) {
  function Game(config) {

    // # Default configuration
    // - `board`
    //  - `selector`: CSS selector to grab the board.
    //  - `dimensions`: Area in which the ships will move.
    //  - `initialEnemies`: Amount of enemies on game start.
    //  - `spawnInterval`: Determines how often a new enemy is spawned.
    // - `ship`
    //  - `movementInterval`: Determines how often ships will move
    //  - `position`: Default position
    //  - `speed`: Default ship speed
    var defaults = {
      'board': {
        'selector': '#board',
        'dimensions': {'width': $(window).width() * 0.66 , 'height': $(window).height() * 0.66 },
        'initialEnemies': 5,
        'spawnInterval': 5000
      },
      'ship': {
        'movemementInterval': 1000,
        'position': {'left': 0, 'top': 0},
        'speed': 500
      }
    }

    // # Game configuration
    var config = $.extend(defaults, config);

    // # GameView
    // The game itself lives in this view.
    var GameView = Backbone.View.extend({
      // ## Properties
      // - `el` is a jQuery object representing the game board.
      // - `enemies` is a `Fleet` object in containing all the enemies.
      // - `enemySpawnerInterval` determines (in ms) how often a new enemy
      //    is added.
      // - `enemySpawnerId` is an interval id. It's used to stop spawning
      //    enemies when the game ends.
      el: $(config.board.selector),
      enemies: null,
      enemySpawnerInterval: config.board.spawnInterval,
      enemySpawnerId: null,

      // ## Methods & functions

      // ### initialize
      // Sets up and starts the game.
      initialize: function () {
        // We limit the context to this particular one.
        _.bindAll(
          this, 'render', 'addEnemies', 'renderEnemy', 'checkScore', 'win'
        );

        // Create an enemy fleet and set events for both adding and removing
        // fleet members.
        this.enemies = new Fleet();
        this.enemies.bind('add', this.renderEnemy);
        this.enemies.bind('remove', this.checkScore);

        // We will start with some enemies and add more periodically
        // `enemySpawnerId` will have the id of the spawner interval. 
        this.addEnemies(config.board.initialEnemies);
        this.enemySpawnerId = setInterval(
          this.addEnemies, this.enemySpawnerInterval);

        // ...and we tell the fleet to start moving.
        this.enemies.moveMembers();
      },
      // ### addEnemies
      // **Usage:** `addEnemies(qty)`
      //
      // Adds `qty` enemies to the fleet. If `qty` is not provided, one enemy
      // will be added
      addEnemies: function (qty) {
        qty = qty || 1;
        while(qty--)
          this.enemies.add(new Ship());
      },
      // ### renderEnemy
      // **Usage** `renderEnemy(enemy)`
      //
      // Creates a `ShipView` for `enemy` and adds it to the bard
      renderEnemy: function (enemy) {
        var enemyView = new ShipView({ model: enemy });
        $(this.el).append(enemyView.render().el);
      },
      // ### checkScore
      // Counts the amount of fleet members and, if all have been destroyed
      // it finishes the game.
      checkScore: function () {
        this.enemies.length === 0 && this.win();
      },
      // ### win
      // Stops the enemy spawner and shows a very insightful message.
      win: function () {
        clearInterval(this.enemySpawnerId);
        window.alert('You win <3! Hire me ^_^');
      }
    });

    // # Ship
    // Model for evil space ships.
    var Ship = Backbone.Model.extend({
      // ## Properties
      // - `template` provides the HTML template for the views
      // - `attributes` contains:
      //  - `position` an object with `left` and `top` properties.
      //  - `speed` the speed used to change position 
      template: $('#shipTemplate').text(),
      attributes: {
        'position': config.ship.position,
        'speed': config.ship.speed
      },

      // ## Methods
      // ### Initialize
      // Binds methods to the model context.
      initialize: function () {
        _.bindAll(this, 'move');
      },
      // ### move
      // **Usage:** `move(x, y)`
      //
      // Sets the position of the ship.
      move: function (x, y) {
        this.set({
          'position': { 'left': x, 'top': y }
        });
      },
    });

    // # ShipView
    var ShipView = Backbone.View.extend({
      // ## Properties
      // - `tagName`: determines what HTML element will wrap the template.
      // - `className`: class for the wrapping element.
      // - `events`: Backbone style element binding.
      tagName: 'div',
      className: 'ship',
      events: {
        'click div.body':  'kill'
      },

      // ## Methods
      // ### Initialize
      // Binds methods to `ShipView` context and listen to model events.
      initialize: function () {
        _.bindAll(this, 'render', 'kill', 'fly');
        this.model.bind('change:position', this.fly);
      },
      // ## render
      // Renders the view template. **Chainable**.
      //
      // Instead of returning the template, we return this same object. The
      // idea is to change properties in here before rendering, i.e, color
      render: function () {
        this.$el.html(this.model.template);
        return this;
      },
      // ## fly
      // Uses a CSS based animation to change the ship position on the board.
      fly: function() {
        this.$el.stop().animate(
          this.model.attributes.position,
          this.model.attributes.speed
        );
      },
      // ## kill
      // Removes the ship from the board and destroys the module.
      kill: function () {
        this.$el.remove();
        this.model.destroy();
      }
    });
    
    // # Fleet
    // A collection of `Ship`
    var Fleet = Backbone.Collection.extend({
      model: Ship,
      // ## Properties
      // - `movementId`: Interval id for fleet movement.
      // - `movementInterval`: How often will the ships change their position.
      movementId: null,
      movementInterval: config.ship.movemementInterval,

      // ## Methods
      // ### Initialize
      // Binds methos to the `Fleet` context and starts the interval
      initialize: function () {
        _.bindAll(this, 'moveMembers');
        this.movementId = setInterval(this.moveMembers, this.movementInterval);
      },
      // ### moveMembers
      // Moves all the members in to random positions.
      moveMembers: function() {
        _.each(this.models, function(ship) {
          ship.move(Math.random() * config.board.dimensions.width, Math.random() * config.board.dimensions.height);
        });
      }
    });

    // # Kick off a new game.
    var gameView = new GameView();
  }

  $(document).ready(Game);
}(jQuery));