// ============================================
// SWIPE CORE — Physics + State Machine v3
// ============================================
console.log('🔥 SWIPE-CORE v3 загружен');

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
// PHYSICS ENGINE — ULTRA RESPONSIVE
// ============================================
var PhysicsEngine = function(config) {
    config = config || {};
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.smoothing = config.smoothing || 0.62;           // 🔥 0.35 → 0.62 (почти instant)
    this.resistanceX = config.resistanceX || 140;        // 🔥 200 → 140 (легче)
    this.resistanceY = config.resistanceY || 80;         // 🔥 100 → 80
    this.throwArcUp = config.throwArcUp !== undefined ? config.throwArcUp : -5;
    this.throwArcDown = config.throwArcDown !== undefined ? config.throwArcDown : 3;
    this.throwRotation = config.throwRotation !== undefined ? config.throwRotation : 30;
    this.throwScale = config.throwScale !== undefined ? config.throwScale : 0.82;
    this.throwBlur = config.throwBlur !== undefined ? config.throwBlur : 3;
    this.flyDuration = config.flyDuration !== undefined ? config.flyDuration : 0.28;    // 🔥 0.4 → 0.28
    this.flyEasing = config.flyEasing || 'cubic-bezier(0.22,0.61,0.36,1)';
    this.snapBackDuration = config.snapBackDuration !== undefined ? config.snapBackDuration : 0.26; // 🔥 0.45 → 0.26
    this.threshold = config.threshold !== undefined ? config.threshold : 72;            // 🔥 80 → 72
    this.velocityThreshold = config.velocityThreshold !== undefined ? config.velocityThreshold : 4; // 🔥 6 → 4
    this.anticipationThreshold = 0.18;
    this.decisionThreshold = 0.55;
};

// 🔥 ULTRA-NATIVE RESISTANCE — мелкие движения без тормоза
PhysicsEngine.prototype.applyResistance = function(v, max) {
    if (Math.abs(v) < 60) return v;  // первые 60px — 1:1 с пальцем
    return v / (1 + Math.abs(v) / max);
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

PhysicsEngine.prototype.isSettled = function() {
    return Math.abs(this.targetX - this.x) < 0.8 && Math.abs(this.targetY - this.y) < 0.8;
};

PhysicsEngine.prototype.reset = function() {
    this.x = 0;
    this.y = 0;
    this.targetX = 0;
    this.targetY = 0;
};

// ============================================
// VELOCITY TRACKER — INSTANT
// ============================================
var VelocityTracker = function(smoothing) {
    this.lastX = 0;
    this.vx = 0;
    this.smoothing = smoothing || 0.7;  // 🔥 0.5 → 0.7
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

console.log('✅ SWIPE-CORE v3 готов');
