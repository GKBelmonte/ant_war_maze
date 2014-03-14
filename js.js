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


  CreateRoot(32, 32, 5.6);// Creates random 
  PlaceHives();
  root = 0; //clean up this shit 
  Draw();
 
 
}

function ColorMap ( num)
{
  switch (num)
  {
    case 0: return '#000000';
    case 1: return '#FFFFFF';
    case 16: return '#EE5555'; //Red enemy
    case 27: return '#5555EE'; //Blue enemy
    case 4: return '#FF9999'; //Red hive
    case 9: return '#9999FF'; //Blue hive
    case 2: return '#DD0000'; //Red hive
    case 3: return '#0000DD'; //Blue hive
    default: return '#000000';
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

  var canvas2 = $('#canvas2')[0];
  var ctx2 = canvas2.getContext('2d');

  var p1Ants = new Array();
  var p2Ants = new Array();
  
  var ToTerminate = new Array();
  
  function Logic()
  {
    
    //Dummy AI logic
    
    p1Ants.forEach(DummyAi);
    p2Ants.forEach(DummyAi);    
    
    p1Ants.forEach( Combat);
    p2Ants.forEach( Combat);
    
    ToTerminate.forEach(function (element) { map[ToTerminate[0]][ToTerminate[1]]=1;  } );
    
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
    
    Draw();
  }
  
function Draw()
{

  for(var ii = 0 ; ii < 128; ii++)
  {
    for(var jj = 0 ; jj < 128; jj++)
    {
      //ctx.fillStyle= "rgb("+HelperFunctions.RandomInt(0,256)+","+HelperFunctions.RandomInt(0,256)+","+HelperFunctions.RandomInt(0,256)+")";
      ctx2.fillStyle = ColorMap( map[ii][jj] );
      ctx2.fillRect(ii*2,jj*2,2,2);
    }
  } 
  setTimeout(Logic,250);
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


function DummyAi (ele) { 
      var possMoves = new Array();
      for(var ii = -1; ii <= 1; ++ii)
      {
        for(var jj = -1; jj <= 1; ++jj)
        {
        
          if(ele[0] + ii < 0 || ele[0] + ii > 127 || ele[1] + jj < 0 || ele[0] + jj > 127 )
            continue;
          if(map[ele[0] + ii][ele[1]+jj] == 1)
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
        
        map[moveTo[0]][moveTo[1]] = color;
      }
    
    }



$(document).load(Initialize(0));


/*
function CreateRoot(nodeI, nodeJ, p)
{
  
  if(nodeI < 1 || nodeI > 126 || nodeJ < 1 || nodeJ > 126 || root[nodeI][nodeJ] == 1)
    return;
  root[nodeI][nodeJ] = 1;
  
  ctx.fillRect(nodeI*2,nodeJ*2,2,2);
  
  
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
      //CreateRoot(goToList[select][0], goToList[select][1], p > 0.7 ? p - 0.005 : 0.7) ;
      setTimeout(CreateRoot ,100 , goToList[select][0], goToList[select][1], p > 0.5 ? p - 0.020 : 0.5);
    }
    goToList.splice(select,1);
 
  }
}*/
