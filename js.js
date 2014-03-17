var ProcessEngine = null;
var DataToGraphPointRatio = 4;
var g_Data = null;
var selected = 'default';
function OnMessage (data)
{
  if(data.command == "process")
  {

  }
  else if (data.command == 'graph-gas')
  {

  }
  else if(data.command == 'graph-rep')
  {

  }
  else
  {
    Log("Unrecognized command response received from background worker", 0 );
  }
}
var ev2;


var P1_REC =10;
var P2_REC =10;

var canvas2 = $('#canvas2')[0];
var ctx2 = canvas2.getContext('2d');


var root = new Array(64);
for(var ii = 0 ; ii < 64; ++ii)
{
  root[ii] = new Array(64);
  for(var jj = 0; jj < 64 ; ++jj)
    root[ii][jj] = 0;
}


var map = new Array(128);
for(var ii = 0 ; ii < 128; ++ii)
{
  map[ii] = new Array(128);
  for(var jj = 0; jj < 128 ; ++jj)
    map[ii][jj] = 0;
}
//var canvas = $('#canvas')[0];
 // var ctx = canvas.getContext('2d');
  
  
function CreateRoot(nodeI, nodeJ, p)
{
  
  if(nodeI < 3 || nodeI > 60 || nodeJ < 3 || nodeJ > 60 || root[nodeI][nodeJ] >= 1)
    return;
  root[nodeI][nodeJ] = 1;
  map[nodeI*2][nodeJ*2] = 1;
  //ctx.fillStyle = "#FFFFFF";
  //ctx.fillRect(nodeI*4,nodeJ*4,2,2);
  
  
  var goToList = new Array();
  if(root[nodeI][nodeJ+1] == 0)
    goToList.push([nodeI,nodeJ+1]);
  if(root[nodeI][nodeJ-1] == 0)
    goToList.push([nodeI,nodeJ-1]);
  if(root[nodeI+1][nodeJ] == 0)
    goToList.push([nodeI+1,nodeJ]);
  if(root[nodeI-1][nodeJ] == 0)
    goToList.push([nodeI-1,nodeJ]);
  
  while(goToList.length > 1 )
  {
    var select = HelperFunctions.RandomInt(0,goToList.length);
    
    if(HelperFunctions.ProbabilityPass(p) && root[goToList[select][0]][goToList[select][1]] == 0)
    {
      var dir = 0;
      if(nodeI > goToList[select][0]){
    //    ctx.fillRect(nodeI*4-2,nodeJ*4,2,2);
        map[nodeI*2-1][nodeJ*2] = 1;
        }
      else if(nodeI < goToList[select][0]){
    //    ctx.fillRect(nodeI*4+2,nodeJ*4,2,2);
        map[nodeI*2+1][nodeJ*2] = 1;
        dir = 1;
        }
      else if (nodeJ > goToList[select][1]){
      //  ctx.fillRect(nodeI*4,nodeJ*4-2,2,2);
        map[nodeI*2][nodeJ*2-1] = 1;
        dir = 2;
        }
      else{
      //  ctx.fillRect(nodeI*4,nodeJ*4+2,2,2);
        map[nodeI*2][nodeJ*2+1] = 1;
        dir = 3;
      }
      
      
      if(!HelperFunctions.ProbabilityPass(0.05)) //Normal
        CreateRoot(goToList[select][0], goToList[select][1], p > 0.7 ? p - 0.005 : 0.7) ;
      else
        CreateRoom(goToList[select][0], goToList[select][1], p > 0.7 ? p - 0.005 : 0.7) ;
      //setTimeout(CreateRoot ,100 , goToList[select][0], goToList[select][1], p > 0.5 ? p - 0.010 : 0.5);
    }
    goToList.splice(select,1);
 
  }
}

var roomRadius = 2;
function CreateRoom(nodeI, nodeJ, p)
{
  if(nodeI < 3 || nodeI > 60 || nodeJ < 3 || nodeJ > 60 || root[nodeI][nodeJ] >= 1)
      return;
  //root[nodeI][nodeJ] = 0; //will add one the loop
  
  if(HelperFunctions.ProbabilityPass(0.1))
    roomRadius = 6;
  else 
    roomRadius = 4;
  for(var ii = -roomRadius; ii <= roomRadius; ++ii)
  {
    
    if(nodeI + ii < 0)
      continue;
    if(nodeI + ii > 63)
      break;
    for(var jj = -roomRadius; jj <= roomRadius; ++jj)
    {
      if(nodeJ + jj < 0)
        continue;
      if(nodeJ + jj > 63)
        break;
      if(root[nodeI+ii][nodeJ+jj] == 0 )
      {
        root[nodeI+ii][nodeJ+jj] = 2; //Everything that is part of the room has now a value of 2
        //ctx.fillStyle = "#FFFFFF";
        //ctx.fillRect((nodeI+ii)*4,(nodeJ+jj)*4,2,2);
        map[nodeI*2][nodeJ*2] = 1;
      }
    }
  }
  //break room walls
  for(var ii = -roomRadius; ii <= roomRadius; ii+=1)
  {  
    if(nodeI + ii < 0)
      continue;
    if(nodeI + ii > 63)
      break;
    for(var jj = -roomRadius ; jj <= roomRadius ; jj+=1)
    {
      if(nodeJ + jj < 0)
        continue;
      if(nodeJ + jj > 63)
        break;
      if(root[nodeI +ii][nodeJ+jj] == 2)
        BreakRoomWalls ( nodeI + ii, nodeJ+jj);
    }
  }
  var roomCells = new Array();
  //set to 1 from 2
  for(var ii = -roomRadius; ii <= roomRadius; ii+=1)
  {  
    if(nodeI + ii < 0)
      continue;
    if(nodeI + ii > 63)
      break;
    for(var jj = -roomRadius ; jj <= roomRadius ; jj+=1)
    {
      if(nodeJ + jj < 0)
        continue;
      if(nodeJ + jj > 63)
        break;
      if(root[nodeI+ii][nodeJ+jj] == 2)
      {
        //root[nodeI+ii][nodeJ+jj] = 1; //Toggling this line joins rooms together
        roomCells.push([ii,jj]);
      }
    }
  }
  
  //Continue room maze
  for(var ii = -roomRadius -1; ii <= roomRadius +1; ii+=1)
  {
    
    if(nodeI + ii < 0)
      continue;
    if(nodeI + ii >  63) 
      break;
    
    
    
    for(var jj = -roomRadius -1; jj <= roomRadius + 1; jj+=1)
    {
      if(nodeJ + jj < 0 || ii == jj || ii == -jj )
        continue;
      if(nodeJ + jj > 63)
        break;
      if(! ( ii == roomRadius + 1 || ii ==  -roomRadius -1 ||
      jj ==roomRadius + 1 || jj == -roomRadius -1 ) )
        continue;
    //  ctx.fillStyle = "#7777FF";
    //  ctx.fillRect(4*(nodeI+ii) - 2*ii/3,4*(nodeJ+jj) - 2*jj/3,2,2);
      if(nodeI + ii < 0)
        continue;
      if(nodeI + ii >  63) 
        break;
      if(root[nodeI+ii][nodeJ+jj] == 0 || HelperFunctions.ProbabilityPass(0.6) )
      {
        //ctx.fillStyle = "#FFFFFF";
        if(!CheckRoomContinuation( roomCells , ii, jj,roomRadius) )
            continue; //The Boundarie picked to continue is not actually connected to the room
        if(roomRadius+1 == Math.abs(ii))
        {
        //  ctx.fillRect(4*(nodeI+ii) - 2*ii/(roomRadius+1),4*(nodeJ+jj),2,2);
          map[2*(nodeI+ii) - ii/(roomRadius+1)][2*(nodeJ+jj)] = 1;
        }
        else
        { 
        //  ctx.fillRect(4*(nodeI+ii),4*(nodeJ+jj) - 2*jj/(roomRadius+1),2,2);
          map[2*(nodeI+ii)][2*(nodeJ+jj) - jj/(roomRadius+1)] = 1;
        }
        CreateRoot(nodeI+ii, nodeJ+jj, p);
      }
      
    }
  }
  
  
}

function BreakRoomWalls(nodeI, nodeJ)
{
  for(var ii = -1; ii <= 1; ++ii)
  {
    
    if(nodeI + ii < 0)
      continue;
    if(nodeI + ii > 63)
      break;
    for(var jj = -1; jj <= 1; ++jj)
    {
      if(nodeJ + jj < 0)
        continue;
      if(nodeJ + jj > 63)
        break;
      
      
      if(root[nodeI + ii][nodeJ+jj] == 2)
      {
      //  ctx.fillRect((4*nodeI+2*ii),(4*nodeJ+2*jj),2,2);
        map[(2*nodeI+ii)][(2*nodeJ+jj)]=1;
      }
    }
  }        
  

}

function CheckRoomContinuation(cells, ii_to, jj_to, radiusSize)
{
  for(var kk = 0; kk < cells.length;++kk)
  {
    if( Math.abs(ii_to) == radiusSize+1)
    {
      if(cells[kk][1] == jj_to && ( ii_to > 0 && cells[kk][0] == radiusSize || ii_to < 0 && cells[kk][0] == -radiusSize ) )
        return true;
    }
    else //jj_to will be == 3
    {
      if(cells[kk][0] == ii_to && ( jj_to > 0 && cells[kk][1] == radiusSize || jj_to < 0 && cells[kk][1] == -radiusSize ) )
        return true;
    }
  }
  return false;

}

var RED_ANT = 2;
var BLUE_ANT = 3;
var EMPTY_SPACE = 1;
var WALL = 0;
var FOOD = 7;

function ColorMap ( num)
{
  switch (num)
  {
    case 0: return {'Color':'#000000' , 'Size':2};
    case 1: return {'Color':'#FFFFFF' , 'Size':2};
    case 16: return {'Color':'#EE5555' , 'Size':2}; //Red hive center
    case 27: return {'Color':'#5555EE', 'Size':2}; //Blue hive center
    case 4: return {'Color':'#FF9999', 'Size':2}; //Red hive
    case 9: return {'Color':'#9999FF', 'Size':2}; //Blue hive
    case 2: return {'Color':'#DD0000', 'Size':1}; //Red enemy
    case 3: return {'Color':'#0000DD', 'Size':1}; //Blue enemy
    case 7: return {'Color':'#539546', 'Size':2};
    default: return {'Color':'#000000', 'Size':2};
  }

}

var BOUNDS = 128;
var LOCX = 10;
var LOCY = 10;

function PlaceHives()
{
  
  //Clear arround hive location
  for(var ii = -4; ii <= 4; ++ii)
  {
    for(var jj = -4; jj <= 4; ++jj)
    {
      map[LOCX + ii][LOCY+jj] = 1;
      map[BOUNDS - (LOCX + ii)][BOUNDS - (LOCY+jj)] = 1;
    }
  }
  //Put hive
  for(var ii = -1; ii <= 1; ++ii)
  {
    for(var jj = -1; jj <= 1; ++jj)
    {
      map[LOCX + ii][LOCY+jj] = 4;
      map[BOUNDS - (LOCX + ii)][BOUNDS - (LOCY+jj)] = 9;
    }
  }
  //Put hive center
   map[LOCX ][LOCY ] = 16;
   map[BOUNDS-LOCX][BOUNDS-LOCY] = 27;
}


var foodInLocCount = new Array(4);
for(var ii= 0; ii < 4;++ii)
{
  foodInLocCount[ii]=new Array(4);
  for(var jj= 0; jj < 4;++jj)
    foodInLocCount[ii][jj] =0;
}

var foodCountdown = new Array(4);
for(var ii= 0; ii < 4;++ii)
{
  foodCountdown [ii]=new Array(4);
  for(var jj= 0; jj < 4;++jj)
    foodCountdown [ii][jj] = 5;
}
var foodModulus = 0;
function PlaceFood()
{
  if(foodModulus++ % 4 != 0)
    return;
  
  for(var ii = 0; ii < 4; ++ii)
  {
    for(var jj = 0; jj < 4; ++jj)
    {
      if (foodCountdown [ii][jj] == 0)
      {
        if(foodInLocCount[ii][jj] < 6)
        {
          foodCountdown [ii][jj] = 7;//reset countdown
          if(_tryToPlaceFood(ii,jj))
            foodInLocCount[ii][jj]+= 1;
        }
      }
      else
        foodCountdown [ii][jj] -=1;
      
    }
  }
  
}
/*
Attempts to put food in 8 random locations. Returns true at first successful attempt. 
Returns false if not possible
*/
function _tryToPlaceFood(offsetI, offsetJ)
{
  for(var att = 0; att < 8; att++)
  {
    var locX= HelperFunctions.RandomInt(0,32);
    var locY= HelperFunctions.RandomInt(0,32);
    if(map[offsetI*32 + locX][offsetJ *31 + locY] == 1)
    {
      map[offsetI*32 + locX][offsetJ *31 + locY] = 7;
      return true;
    }
  }
  return false;
} 

var p1Ants = new Array();
var p2Ants = new Array();

var p1Moves = new Array();
var p2Moves = new Array();

var ToTerminate = new Array();

function Logic()
{
  
  //Dummy AI logic
  
  p1Ants.forEach(DummyAi);
  p2Ants.forEach(DummyAi);    
  
  //Calculate combat casualties
  p1Ants.forEach( Combat);
  p2Ants.forEach( Combat);
  
  
  //Remove the dead
  ToTerminate.forEach(function (element) { map[element[0]][element[1]]=1;  } );
  
  //Create one ant per player if at least 1 resource is had
  var p1AntCreated = false;
  var p2AntCreated = false;
  for(var ii = -2; ii <= 2; ++ii)
  {
    for(var jj = -2; jj <= 2; ++jj)
    {
      if(! (ii == 2 || ii == -2 ||jj==2 || jj == -2))
        continue;
      if(map[LOCX + ii][LOCY+jj] == 1 && P1_REC > 0 && !p1AntCreated)
      {
        map[LOCX + ii][LOCY+jj] = 2;
        p1Ants.push([LOCX + ii,LOCY+jj]);
        P1_REC--;
        p1AntCreated= true;
      }
      if(map[BOUNDS - (LOCX + ii)][BOUNDS - (LOCY+jj)] == 1 && P2_REC > 0 && !p2AntCreated)
      {
        map[BOUNDS - (LOCX + ii)][BOUNDS - (LOCY+jj)] = 3;
        p2Ants.push([BOUNDS - (LOCX + ii),BOUNDS - (LOCY+jj)]);
        P2_REC--;
        p2AntCreated= true;
      }
    }
  }
  
  //Place food
  PlaceFood();
  
  Draw();
}
  
function Draw()
{

  for(var ii = 0 ; ii < 128; ii++)
  {
    for(var jj = 0 ; jj < 128; jj++)
    {
      //ctx.fillStyle= "rgb("+HelperFunctions.RandomInt(0,256)+","+HelperFunctions.RandomInt(0,256)+","+HelperFunctions.RandomInt(0,256)+")";
      var sizeColor =ColorMap( map[ii][jj] )
      ctx2.fillStyle = sizeColor.Color;
      ctx2.fillRect(ii*2,jj*2,2,2);
    }
  } 
  setTimeout(Logic,100);
}






var COMBAT_RADIUS = 2;

function EnemiesInRange(ant)
{
  var count = 0
  for(var ii = -COMBAT_RADIUS ; ii <= COMBAT_RADIUS ; ++ii)
  {
    for(var jj = -COMBAT_RADIUS ; jj <= COMBAT_RADIUS ; ++jj)
    {
      if( (ii+ant[0] < 0 || ii+ant[0] > 127 || jj+ant[1] < 0 || jj+ant[1] > 127  ) 
          || ( /*Corners*/Math.abs(ii) == 2 && (ii == jj || ii == -jj) ) ) //if out of bounds OR a corner
        continue; //Dont check
      if(map[ii+ant[0]][jj+ant[1]] == EnemyOf(ant) )
      {
        count+=1;
      }
    }
  }
  return count;
}
/*for every ant:
        for each enemy in range of ant (using attackadius2):
            if (enemies(of ant) in range of ant) >= (enemies(of enemy) in range of enemy) then
                the ant is marked dead (actual removal is done after all battles are resolved)
                break out of enemy loop
    */
function Combat(ant)
{
  var enemiesInRange = new Array();
  for(var ii = -COMBAT_RADIUS ; ii <= COMBAT_RADIUS ; ++ii)
  {
    for(var jj = -COMBAT_RADIUS ; jj <= COMBAT_RADIUS ; ++jj)
    {
      if( (ii+ant[0] < 0 || ii+ant[0] > 127 || jj+ant[1] < 0 || jj+ant[1] > 127  ) 
          || ( /*Corners*/Math.abs(ii) == 2 && (ii == jj || ii == -jj) ) ) //if out of bounds OR a corner
        continue; //Dont check
      if(map[ii+ant[0]][jj+ant[1]] == EnemyOf(ant) )
      {
        enemiesInRange.push([ii+ant[0],jj+ant[1]]);

      }
    }
  }
  for(var ii = 0 ; ii < enemiesInRange.length ; ++ii)
  {
    if(/*enemies(of ant) in range of ant*/enemiesInRange.length 
    >= 
    /*enemies(of enemy) in range of enemy*/
    EnemiesInRange(enemiesInRange[ii]))
    {
      ToTerminate.push(ant);
      break;
    }
  }
}

function EnemyOf(ant)
{
  var antColor =map[ant[0]][ant[1]];
  if(antColor == 2) return 3;
  else if(antColor== 3) return 2;
  else return 0;
}


function MapFromPair ( pair)
{return map[pair[0]][pair[1]];}

function Move (fromX, fromY, toX, toY)
{
  this.From = [fromX,fromY];
  this.To = [toX, toY];
}

function Delta(from , to)
{
  return Math.sqrt( (from[0] - to[0])(from[0] - to[0]),
                    (from[1] - to[1])(from[1] - to[1]) );
}

function UpdateAntLocation(from, to , color)
{
  var checkArr ;
  if(color == 2)
    checkArr = p1Ants;
  else if (color == 3)
    checkArr = p2Ants;
    
  var index = -1;
  //THIS COULD GET LONG! CHANGE IT TO A HASH. IT IS NOT IMPOSSIBLE SINCE
  //THE HASH WOULD BE PERFECT (ii + jj >> 8)
  for(var ii = 0 ; ii <  checkArr.length; ++ ii)
  {
    if( checkArr[ii][0] == from[0] && checkArr[ii][1] == from[1])
    {
      index = ii;
    }
  }
  
  if(index != -1)
  {
    checkArr[ii][0] = to[0] ;
    checkArr[ii][1] = to[1] ;
  }
  else
    console.log("Ant not found in list!");
} 

function MakeMoves ( listOfMoves, color)
{
  for(var ii = 0 ; ii < listOfMoves.length ; ++ ii)
  {
    var move = listOfMoves[ii];
    var from = MapFromPair(move.From);
    var to = MapFromPair(move.To);
    if( from != color )
    {
      console.log("Illegal move: piece does not belong to player");
      continue;
    }
    if( to != EMPTY_SPACE || to != FOOD)
    {  
      console.log("Illegal move: " + move.From + " to " +  move.To +" moving to illegal block");
      continue;
    }
    if(Delta(from, to) >2 )
    {
      console.log("Illegal move: " + move.From + " to " +  move.To +" exceeds two blocks");
      continue;
    }
    
    
    map[move.From[0]][move.From[1]] = 1; //set white
    
    UpdateAntLocation(move.From, move.To, color);
    if(map[moveTo[0]][moveTo[1]] == 7) //Food eaten
    {
      if( from == 2 )
        P1_REC +=1;
      else if (from == 3)
        P2_REC +=1;

      foodInLocCount[ moveTo[0] >> 5][ moveTo[1] >> 5 ] -= 1;
    }

    map[move.To[0]][move.To[1]] = color;
  }
}

function DummyAi (ele) { 
      var possMoves = new Array();
      for(var ii = -1; ii <= 1; ++ii)
      {
        for(var jj = -1; jj <= 1; ++jj)
        {
        
          if(ele[0] + ii < 0 || ele[0] + ii > 127 || ele[1] + jj < 0 || ele[0] + jj > 127 )
            continue;
          if(map[ele[0] + ii][ele[1]+jj] == 1 || map[ele[0] + ii][ele[1]+jj] == 7)
            possMoves.push([ele[0] + ii,ele[1]+jj] );
          
        }
      }
      if(possMoves.length > 0)
      {
        var moveTo = possMoves[HelperFunctions.RandomInt(0,possMoves.length)];
        
        var color = map[ele[0]][ele[1]]; //save color
        map[ele[0]][ele[1]] = 1; //set white
        ele[0] = moveTo[0];
        ele[1] = moveTo[1];
        
        if(map[moveTo[0]][moveTo[1]] == 7) //Food eaten
        {
          if( color == 2 )
            P1_REC +=1;
          else
            P2_REC +=1;
            
          foodInLocCount[ moveTo[0] >> 5][ moveTo[1] >> 5 ] -= 1;
        }
        
        map[moveTo[0]][moveTo[1]] = color;
      }
    
    }


    
    
    
function findPos(obj) {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return { x: curleft, y: curtop };
    }
    return undefined;
}

function Initialize(arg1)
{
  $('#canvas2').mousemove(function(e) {
    var pos = findPos(this);
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;
    var coord = "x=" + x + ", y=" + y;
    var coordBy4 = "x=" + x/4 + ", y=" + y/4;
    var c = this.getContext('2d');
    var p = c.getImageData(x, y, 1, 1).data; 
    var val = '?';//root[Math.floor(x/4)][Math.floor(y/4)];
    $('#loc').html(coord + "<br>"+ coordBy4 + "<br>" + val);
});

   $('.parameters-label').click(ToggleVisibilityClick);
  CreateRoot(32, 32, 5.6);// Creates random 
  PlaceHives();
  root = 0; //clean up this shit 
  Draw();
 
 
}

$(document).load(Initialize(0));



