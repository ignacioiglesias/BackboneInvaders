(function ($) {
  function Game() {
    var Ship = Backbone.Model.extend({
      template: $('#shipTemplate').text(),
      attributes: {
        'position': {'left': 0, 'top': 0},
        'speed': 500
      },

      initialize: function () {
        _.bindAll(this, 'move');
      },

      move: function (x, y) {
        this.set({
          'position': { 'left': x, 'top': y }
        });
      },
    });

    var ShipView = Backbone.View.extend({
      tagName: 'div',
      className: 'ship',
      events: {
        'click div.body':  'kill'
      },
      initialize: function () {
        _.bindAll(this, 'render', 'kill', 'fly');
        this.model.bind('change:position', this.fly);
      },
      render: function () {
        // Instead of returning the template, we return this same object. The
        // idea is to change properties in here before rendering, i.e, color
        this.$el.html(this.model.template);
        return this;
      },
      fly: function() {
        this.$el.stop().animate(this.model.attributes.position, this.model.attributes.speed);
      },
      kill: function () {
        this.$el.remove();
        this.model.destroy();
      }
    });

    var Fleet = Backbone.Collection.extend({
      model: Ship,
      
      movementId: null,
      movementInterval: 1000,

      initialize: function () {
        _.bindAll(this, 'moveMembers');
        this.movementId = setInterval(this.moveMembers, this.movementInterval);
      },

      moveMembers: function() {
        _.each(this.models, function(ship) {
          ship.move(Math.random() * 500, Math.random() * 500);
        });
      }
    });

    var GameView = Backbone.View.extend({
      el: $('#board'),
      enemies: null,

      // ## Enemy spawner:
      enemySpawnerInterval: 5000,
      enemySpawnerId: null,

      initialize: function () {
        _.bindAll(this, 'render', 'addEnemies', 'renderEnemy', 'checkScore', 'win');

        this.enemies = new Fleet();
        this.enemies.bind('add', this.renderEnemy);
        this.enemies.bind('remove', this.checkScore);

        // We will start with some enemies and add more periodically
        this.addEnemies(5);
        this.enemySpawnerId = setInterval(this.addEnemies, this.enemySpawnerInterval);
        this.enemies.moveMembers();
      },
      addEnemies: function (qty) {
        var ship;
        qty = qty || 1;

        while(qty--) {
          ship = new Ship();
          this.enemies.add(ship);
        }
      },
      renderEnemy: function (enemy) {
        var enemyView = new ShipView({ model: enemy });
        $(this.el).append(enemyView.render().el);
      },
      checkScore: function () {
        this.enemies.length === 0 && this.win();
      },
      win: function () {
        clearInterval(this.enemySpawnerId);
        window.alert('You win <3! Hire me ^_^');
      }
    });
    
    console.log('Starting game');
    var gameView = new GameView();
  }

  $(document).ready(Game);
}(jQuery));