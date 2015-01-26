/**
 * Created by bblumberg on 1/26/15.
 */
var Pose = require('../math/Pose');
var Vector3 = require('../math/Vector3');
var Quaternion = require('../math/Quaternion');


/**
 * A Mesh element in a URDF.
 *
 * @constructor
 * @param options - object with following keys:
 *  * xml - the XML element to parse
 */
function UrdfJoint(options) {
  this.pose = null;
  this.name = options.xml.getAttribute('name');

  // get the joint pose
  var origins = options.xml.getElementsByTagName('origin');
  if (origins.length === 0) {
    // use the identity as the default
    this.origin = new Pose();
  }
  else {
    // Check the XYZ
    var xyz = origins[0].getAttribute('xyz');
    var position = new Vector3();
    if (xyz) {
      xyz = xyz.split(' ');
      position = new Vector3({
        x : parseFloat(xyz[0]),
        y : parseFloat(xyz[1]),
        z : parseFloat(xyz[2])
      });
    }

    // Check the RPY
    var rpy = origins[0].getAttribute('rpy');
    var orientation = new Quaternion();
    if (rpy) {
      rpy = rpy.split(' ');
      // Convert from RPY
      var roll = parseFloat(rpy[0]);
      var pitch = parseFloat(rpy[1]);
      var yaw = parseFloat(rpy[2]);
      var phi = roll / 2.0;
      var the = pitch / 2.0;
      var psi = yaw / 2.0;
      var x = Math.sin(phi) * Math.cos(the) * Math.cos(psi) - Math.cos(phi) * Math.sin(the)
        * Math.sin(psi);
      var y = Math.cos(phi) * Math.sin(the) * Math.cos(psi) + Math.sin(phi) * Math.cos(the)
        * Math.sin(psi);
      var z = Math.cos(phi) * Math.cos(the) * Math.sin(psi) - Math.sin(phi) * Math.sin(the)
        * Math.cos(psi);
      var w = Math.cos(phi) * Math.cos(the) * Math.cos(psi) + Math.sin(phi) * Math.sin(the)
        * Math.sin(psi);

      orientation = new Quaternion({
        x : x,
        y : y,
        z : z,
        w : w
      });
      orientation.normalize();
    }
    this.origin = new Pose({
      position : position,
      orientation : orientation
    });
  }
  this.axis = new Vector3(0,0,1);
  //// get the axis
  var axisElement = options.xml.getElementsByTagName('axis');
  if(axisElement.length)
  {
    var axisXYZ = axisElement[0].getAttribute('xyz');
    if (axisXYZ) {
      axisXYZ = axisXYZ.split(' ');
      this.axis = new Vector3({
        x : parseFloat(axisXYZ[0]),
        y : parseFloat(axisXYZ[1]),
        z : parseFloat(axisXYZ[2])
      });
    }
  }

  //get the parent link
  var parentLinkElement = options.xml.getElementsByTagName('parent');
  this.parentLink = parentLinkElement[0].getAttribute('link');
  // get the child link
  var childLinkElement = options.xml.getElementsByTagName('child');
  this.childLink = childLinkElement[0].getAttribute('link');

  //get limits if there are any
  this.limit = {};
  var limitElement = options.xml.getElementsByTagName('limit');
  if(limitElement.length)
  {
    this.limit['effort'] = limitElement[0].getAttribute('effort');
    this.limit['upper'] = limitElement[0].getAttribute('upper');
    this.limit['lower'] = limitElement[0].getAttribute('lower');
    this.limit['velocity'] = limitElement[0].getAttribute('velocity');
  }


}

module.exports = UrdfJoint;