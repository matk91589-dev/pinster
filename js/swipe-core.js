// ============================================
// SWIPE CORE — Physics + State Machine v3.2
// ============================================
console.log('🔥 SWIPE-CORE v3.2 загружен');

var SwipeState = {
    IDLE: 'idle',
    DRAGGING: 'dragging',
    THROWING: 'throwing',
    RESETTING: 'resetting',
    ANTICIPATING: 'anticipating',
    DECIDING: 'deciding'
};

var SwipeMachine = function() {
    this.state = SwipeState.IDLE;
    this.listeners = [];
};

SwipeMachine.prototype.set = function(state) {
    if (this.state === state) return;
    var prev = this.state;
    this.state = state;
    for (var i = 0; i < this.listeners.length; i++) {
        this.listeners[i](state, prev);
    }
};

SwipeMachine.prototype.is = function(state) {
    return this.state === state;
};

SwipeMachine.prototype.on = function(fn) {
    this.listeners.push(fn);
};

// ============================================
// PHYSICS ENGINE — iOS RUBBER BAND
// ============================================
var PhysicsEngine = function(config) {
    config = config || {};
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.smoothing = config.smoothing || 0.44;
    this.resistanceX = config.resistanceX || 170;
    this.resistanceY = config.resistanceY || 95;
    this.throwArcUp = config.throwArcUp !== undefined ? config.throwArcUp : -4;
    this.throwArcDown = config.throwArcDown !== undefined ? config.throwArcDown : 3;
    this.throwRotation = config.throwRotation !== undefined ? config.throwRotation : 20;  // 🔥 30→20 дороже
    this.throwScale = config.throwScale !== undefined ? config.throwScale : 0.84;
    this.throwBlur = config.throwBlur !== undefined ? config.throwBlur : 3;
    this.flyDuration = config.flyDuration !== undefined ? config.flyDuration : 0.30;
    this.flyEasing = config.flyEasing || 'cubic-bezier(0.22,0.61,0.36,1)';
    this.snapBackDuration = config.snapBackDuration !== undefined ? config.snapBackDuration : 0.28;
    this.threshold = config.threshold !== undefined ? config.threshold : 88;
    this.velocityThreshold = config.velocityThreshold !== undefined ? config.velocityThreshold : 5;
    this.anticipationThreshold = 0.20;
    this.decisionThreshold = 0.58;
};

// 🔥 iOS RUBBER BAND — tanh formula
PhysicsEngine.prototype.applyResistance = function(v, max) {
    return max * Math.tanh(v / max);
};

PhysicsEngine.prototype.setTarget = function(dx, dy) {
    this.targetX = this.applyResistance(dx, this.resistanceX);
    this.targetY = this.applyResistance(dy, this.resistanceY);
};

PhysicsEngine.prototype.update = function() {
    this.x = this.x + (this.targetX - this.x) * this.smoothing;
    this.y = this.y + (this.targetY - this.y) * this.smoothing;
    return { x: this.x, y: this.y };
};

PhysicsEngine.prototype.getProgress = function() {
    return Math.min(Math.abs(this.x) / this.threshold, 1);
};

PhysicsEngine.prototype.isAnticipating = function() {
    return this.getProgress() > this.anticipationThreshold;
};

PhysicsEngine.prototype.isDeciding = function() {
    return this.getProgress() > this.decisionThreshold;
};

PhysicsEngine.prototype.shouldCommit = function(velocityX) {
    return Math.abs(velocityX) > this.velocityThreshold || Math.abs(this.x) > this.threshold;
};

// 🔥 МЯГЧЕ — без micro-adjustments
PhysicsEngine.prototype.isSettled = function() {
    return Math.abs(this.targetX - this.x) < 1.0 && Math.abs(this.targetY - this.y) < 1.0;
};

PhysicsEngine.prototype.reset = function() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
};

// ============================================
// VELOCITY TRACKER — CLEAN
// ============================================
var VelocityTracker = function(smoothing) {
    this.lastX = 0;
    this.vx = 0;
    this.smoothing = smoothing || 0.32;
};

VelocityTracker.prototype.update = function(x, dt) {
    var raw = (x - this.lastX) / Math.max(dt, 1) * 16.67;
    this.vx = this.vx + (raw - this.vx) * this.smoothing;
    this.lastX = x;
    return this.vx;
};

VelocityTracker.prototype.reset = function() {
    this.vx = 0;
    this.lastX = 0;
};

console.log('✅ SWIPE-CORE v3.2 готов');
