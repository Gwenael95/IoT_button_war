# IoT button war
This is an IoT lesson project.

## Gameplay
This is a 2 player game (later could accept more players).
The setup include 3 LED connected to a zigbee, and 2 controllers
each composed of 3 button connected to a zigbee.

Players will have to click as fast as possible on the  
button corresponding to the LED turned on in order to make 
the greatest score. Each error will cost a few point.

# env
in the `.env` file, you should set the port `SERIAL_PORT` of the zigbee you
will connect to your computer. 
As we need to be able to click quickly on button to have fair
game, we have seen no better way than connecting all controllers
to computer that will run the server.

So you should set `SERIAL_PORT2` and others to have more 
than 1 controller detected.
Note that the server actually need to restart to detect the controllers
connected.

## controller setup
The server should automatically associate PIN used as `digital input` 
to the correct button. 
The lesser `PIN` will be the `button 1`, the next will be the `button 2`, 
and next the `button 3`. 
For example : with `D1, D3, D4, D5` as `digital input`, we consider
`D1` as `button 1`, `D3` as `button 2`, `D4` as `button 3`. 
You just need to well-ordered the controller setup.

### controller zigbee config
Each zigbee module used for controllers should send message 
to the first controller or itself to allow optimal button spam.

