# Open World for threejs
A minimalistic framework to make it easier creating an multi user open world with threejs for both smartphones and desktops. 

Note, there is a new <a href='https://github.com/forthtemple/openworlddart'>dart/flutter</a> version based upon this framework. Because it is written in flutter the new repository allows for creating native iOS and Android apps as opposed to this framework which is web only.

To demonstrate the framework, a demo has been made for the Second Temple, the temple that was at the center of judaism before 77AD. It is where the dome of the rock currently stands on the temple mount in Jerusalem. In the demo you can explore the Second Temple. This framework also includes the original blender models for the temple and the actors in the demo. It also demonstrates a multi user server. The demo should work on smartphone browsers (tested on iPhone and iPad 9.3) and desktops.

Live Demo http://www.forthtemple.com/secondtemple

Click 'connect' to connect to the server

![alt tag](http://www.forthtemple.com/secondtemple/screenshots/temple200.jpg)  ![alt tag](http://www.forthtemple.com/secondtemple/screenshots/templeiii200.jpg)


**Installation**  
If you unzip the distrubution under your webserver root then browsing http://localhost/openworldthreejs/web/secondtemple/ should display the Second Temple.

For instructions on setting up the server refer to the server section at the end.

**Intro**  
The framework revolves around a main world model that contains surfaces and walls that the framework detects to allow a user to walk around a model. The demo includes a blender model for the second temple (/models/secondtemple/temple/temple.blend). The minimalistic framework is in the javascript file /web/secondtemple/openworldjs/openworld.js and has functions that make it possible to work with world coordinates and directions instead of local coordinates and rotations. For example the coordinates 5,4,0 means 5,4 in the xy plane and height zero off the surface of the model. Also direction can be specified with 90 degrees being east, 180 being south.

The openworld framework also includes an all purpose controller with virtual joystick that works on a smartphone. It also works with a keyboard and mouse.

There is also a server written in PHP and MySQL that allows multiple users to interact on the server. It has a base server that can be the basis for other multi user open worlds.


**Using blender models**  
All the models in the demos are created using Blender. There are included in the repository. In the demo, models are exported as wavefront 'obj' models since they allow for multiple texturing. For actors they are exported from Blender as json models since they include animations which json allows for but obj does not.

If you open /models/secondtemple/temple/temple.blend notice the multiple meshes. Notice that some have the word wall and some surface in them.

![alt tag](http://www.forthtemple.com/secondtemple/screenshots/wallsurface.jpg) 

A surface mesh will be intersected by the open world framework to determine the ground. Walls are also detected to stop players walking through walls. Also notice the units of distance in the blender model are around about 1 meter. Also Z is up. Also some meshes are hidden in order to reduce the size. To export the temple.blend model to obj, select all the meshes you wish to export (will exclude the hidden ones) and then export the obj and then click on 'selection only' to only export the selected meshes.

![alt tag](http://www.forthtemple.com/secondtemple/screenshots/exportobj.jpg) 

To export an actor like a priest (/models/secondtemple/priest/priest.blend) to json make sure the Blender export io_three is placed under the directory Blender\2.xx\scripts\addons. Exporting to json can be fiddly where you must first select the mesh you wish to export like selecting body below:

![alt tag](http://www.forthtemple.com/secondtemple/screenshots/jsonselectmesh.jpg) 

And then when you export to json you must specify all the correct flags once to export so that it is not missing animation, bone, texture information. These are the ones that work:

![alt tag](http://www.forthtemple.com/secondtemple/screenshots/exportjsonsmall.jpg) 

**Server**  
The server is written in pure PHP and MySQL with no dependencies. MySQL is used to hold the player positions and also includes messaging. Every second a player polls the server giving the server via json the players position. In return the server gives player positions in the players vicinity and also any messages from players. There is tests for player abuse, such as polling much more often or giving false positions, but this could easily be added in the future.
  
*Installation*  
1. From the distribution copy the server directory to your host that has PHP and MySQL. It should be the same directory as your index.html file. Eg  
     - index.html  
     - actors  
     - server  
     - models  
     - openworldjs  
2. Create a MySQL database such as 'openworld' with a user and password  
3. Run the openworld.sql script under /server on the new database  
4. Change the base_server.php mysql username and password and database to the database you just setup  
  
Now when you click on 'Connect' when browse to index.html it should connect you to the server.

*Modifying game parameters*  
Some of the game specific parameters for the server are specified in secondtemple.php. These paramaters include $MAX_DISTANCE where if it is greater than 0 will only tell players of other players that are within that distance. $CLOSET will show just the closest x number of players. 



