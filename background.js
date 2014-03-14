/**
background processing
*/

        var ProteinGazPromoterStrength = 1;
        var ProteinGazSize = 4;
        var ProteinGazHalfLife = 20;
        var ProteinGazThreshold = 25; // = SynthesisThreshold
        var ProteinGazTimeConstant = 3;

        var GasProductionFactor = 1;
        var GasDissipation = 39.5;
        
        var RepressorPromoterStrength = 4;
        var RepressorSize = 1;
        var RepressorHalfLife = 20;
        var RepressorThreshold = 25; //Q max ~ 100
        var RepressorTimeConstant = 3;
        
        var AhlrPromoterStrength = 4;
        var AhlrSize = 1;
        var AhlrHalfLife = 10;
        var AhlrThreshold = 10; //Q max ~ 100
        var AhlrTimeConstant = 2;
        
        var AhlPromoterStrength = 4;
        var AhlSize = 1;
        var AhlHalfLife = 10;
        var AhlThreshold = 10; //Q max ~ 100
        var AhlTimeConstant = 2;
        
        
        var ProteinGazQuantity = 0;
        var RepressorQuantity = 0;
        var GasQuantity = 0;
        var AhlrQuantity = 0;
        var AhlQuantity = 0;
        
        var nowProteinGazQuantity = 0;
        var nowRepressorQuantity = 0;
        var nowGasQuantity = 0;
        var nowAhlrQuantity = 0;
        
        var DELTA_TIME = 0.125;
        var SAMPLE_POINTS = 3200;

        function GetNextProteinGazQuantity()
        {
            nowProteinGazQuantity = ProteinGazQuantity;
            ProteinGazQuantity += GetProteinGazRate() * DELTA_TIME;
            if (ProteinGazQuantity < 0)
                ProteinGazQuantity = 0;
            return nowProteinGazQuantity ;
        }


        function GetNextRepressorQuantity()
        {
            nowRepressorQuantity = RepressorQuantity;
            RepressorQuantity += GetRepressorRate() * DELTA_TIME;
            if (RepressorQuantity < 0)
                RepressorQuantity = 0;
            return nowRepressorQuantity;
        }

        function GetNextGasQuantity()
        {
            nowGasQuantity = GasQuantity;
            GasQuantity += GetGasRate() * DELTA_TIME;
            if (GasQuantity < 0)
                GasQuantity = 0;
            return nowGasQuantity ;
        }
        
        function GetNextAhlrQuantity()
        {
            nowAhlrQuantity = AhlrQuantity;
            AhlrQuantity += GetAhlrRate() * DELTA_TIME;
            if (AhlrQuantity < 0)
                AhlrQuantity = 0;
            return nowAhlrQuantity ;
        }
        
        function GetNextAhlQuantity()
        {
            nowAhlQuantity = AhlQuantity;
            AhlQuantity += GetAhlRate() * DELTA_TIME;
            if (AhlQuantity < 0)
                AhlrQuantity = 0;
            return nowAhlQuantity ;
        }
        
        function GetProteinGazRate( )
        {
          
            var result = 0;
            if (nowRepressorQuantity >= ProteinGazThreshold)
                result = ProteinGazPromoterStrength * ProteinGazSize * Math.exp( - (nowRepressorQuantity - ProteinGazThreshold) / ProteinGazTimeConstant);
            else
                result = ProteinGazPromoterStrength * ProteinGazSize;
            var halfLifeInfluence =  nowProteinGazQuantity / ProteinGazHalfLife ;
            result -= halfLifeInfluence;
            return result;
        }

        function GetAhlRate( )
        {
            var result = 0;
            if (nowRepressorQuantity >= AhlThreshold)
                result = AhlPromoterStrength * AhlSize * Math.exp( - (nowRepressorQuantity - AhlThreshold) / AhlTimeConstant);
            else
                result = AhlPromoterStrength * AhlSize;
            var halfLifeInfluence =  nowAhlQuantity / AhlHalfLife ;
            result -= halfLifeInfluence;
            return result;
        }
        
        function GetRepressorRate()
        {
            var result = 0;
            var halfLifeInfluence = nowRepressorQuantity/ ProteinGazHalfLife;

            if (nowGasQuantity < RepressorThreshold)
                result = 0;
            else
                result = RepressorPromoterStrength * RepressorSize - RepressorPromoterStrength * RepressorSize * Math.exp( - (nowGasQuantity - RepressorThreshold) / RepressorTimeConstant);
            result -= halfLifeInfluence;
            return result;
        }
        
        function GetAhlrRate()
        {
            var result = 0;
            var halfLifeInfluence = nowAhlrQuantity/ AhlrHalfLife;

            if (nowGasQuantity < AhlrThreshold)
                result = 0;
            else
                result = AhlrPromoterStrength * AhlrSize - AhlrPromoterStrength * AhlrSize * Math.exp( - (nowGasQuantity - AhlrThreshold) / AhlrTimeConstant);
            result -= halfLifeInfluence;
            return result;
        }
        
        function GetGasRate()
        {
          var result = 0;
          result += GasProductionFactor * nowProteinGazQuantity;
          result -= GasDissipation;
          return result;
        }
        

      
        
        
        function LoadParams( params )
        {
            //Reset values
            ProteinGazQuantity = 0;
            RepressorQuantity = 0;
            GasQuantity = 0 ;
            AhlrQuantity = 0;
            AhlQuantity = 0;
            
            nowProteinGazQuantity = 0;
            nowRepressorQuantity = 0;
            nowGasQuantity = 0 ;
            nowAhlrQuantity = 0;
            nowAhlQuantity = 0;
            
            if(params != null)
            {
            
              if(!isNaN(params['GasProteinHalfLife' ]))  ProteinGazHalfLife = params['GasProteinHalfLife' ];
              if(!isNaN(params['GasProteinStrength' ]))ProteinGazPromoterStrength = params['GasProteinStrength' ];
              if(!isNaN(params['GasProteinSize'] ))  ProteinGazSize = params['GasProteinSize'] ;
              if(!isNaN(params['GasProteinThreshold'] ))ProteinGazThreshold = params['GasProteinThreshold'] ;
              if(!isNaN(params['GasProteinSensitivity'] ))ProteinGazTimeConstant = params['GasProteinSensitivity'];
              
              if(!isNaN(params['GasProduction'] )) GasProductionFactor = params['GasProduction'];
              if(!isNaN(params['GasDiffusion' ])) GasDissipation = params['GasDiffusion' ];//woops
              
              if(!isNaN(params['RepressorHalfLife' ])) RepressorHalfLife = params['RepressorHalfLife'];
              if(!isNaN(params['RepressorStrength']))  RepressorPromoterStrength = params['RepressorStrength'];
              if(!isNaN(params['RepressorSize' ])) RepressorSize = params['RepressorSize' ];
              if(!isNaN(params['RepressorThreshold'] ))  RepressorThreshold = params['RepressorThreshold'];
              if(!isNaN(params['RepressorSensitivity'] )) RepressorTimeConstant = params['RepressorSensitivity'] ;
              
              if(!isNaN(params['AhlrHalfLife' ])) AhlrHalfLife = params['AhlrHalfLife'];
              if(!isNaN(params['AhlrStrength']))  AhlrPromoterStrength = params['AhlrStrength'];
              if(!isNaN(params['AhlrSize' ])) AhlrSize = params['AhlrSize' ];
              if(!isNaN(params['AhlrThreshold'] ))  AhlrThreshold = params['AhlrThreshold'];
              if(!isNaN(params['AhlrSensitivity'] )) AhlrTimeConstant = params['AhlrSensitivity'] ;
              
              if(!isNaN(params['AhlHalfLife' ])) AhlHalfLife = params['AhlHalfLife'];
              if(!isNaN(params['AhlStrength']))  AhlPromoterStrength = params['AhlStrength'];
              if(!isNaN(params['AhlSize' ])) AhlSize = params['AhlSize' ];
              if(!isNaN(params['AhlThreshold'] ))  AhlThreshold = params['AhlThreshold'];
              if(!isNaN(params['AhlSensitivity'] )) AhlTimeConstant = params['AhlSensitivity'] ;
              
              
              if(!isNaN(params['DeltaTime'] ))  DELTA_TIME = params['DeltaTime'];
              if(!isNaN(params['DataSize'] )) SAMPLE_POINTS = params['DataSize'];
              
            }
        }        
        
        
var g_log = new Array();
var g_minPriorityForLog = 50;
function Log(message, priority)
{
	if(priority == undefined)
		priority = 5;
	if(priority <= g_minPriorityForLog)
  {
     //console.log(message);
    g_log .push( message );
  }
}

function CreateProperMessage ( command , value )
{
    var stringed = JSON.stringify(value);
    var obs = { "command" : command, "vals" : stringed };
    var total = JSON.stringify(obs);
    return total;
}

function ReadProperMessage(message)
{
    var obj = null;
    try{ obj = JSON.parse(message);}
    catch (ex) { obj = null/*postMessage("Unrecognized command") ;*/ }
    
    if(obj != null )
    {
        var v = JSON.parse(obj.vals);
        var c =  obj.command;
        obj = { "command" : c, "vals" : v };
    }
    return obj;
}

/**
Shove something similar in the background process
*/
self.onmessage = function (e) {
   
    var obj = e.data;
    if(obj != null )
    {
        if ( obj.command == "process" )
        {
            LoadParams(obj.vals);
            var res = new Array();
            res.push(["Time","Gas Protein","Repressor","Gas","AhlR","Ahl"])
            for (var ii = 0; ii < SAMPLE_POINTS; ++ii)
            { 
                //TODO: Somehow make these calls simultaneous. They use values from the future currently.
                var pg = GetNextProteinGazQuantity();
                var rep = GetNextRepressorQuantity();
                var gas = GetNextGasQuantity();
                var ahlr = GetNextAhlrQuantity();
                var ahl = GetNextAhlQuantity();
                res.push([ii*DELTA_TIME , pg, rep, gas, ahlr,ahl]);
            }
            postMessage({"command":"process" ,"vals":res});
        }
        else if(obj.command == "graph-rep")
        {
          var REP_SAMPLES = 100;
        
          LoadParams(obj.vals);
          var res = new Array();
          res.push(["Gas","Delta Repressor"])
          for( var ii = 0; ii < REP_SAMPLES ; ++ ii)
          {
            var delta = GetRepressorRate();
            res.push([nowGasQuantity, delta]);
            nowGasQuantity += 0.5;
          }
          postMessage({"command":"graph-rep" ,"vals":res});
        }
        else if(obj.command == "graph-gas")
        {
          var GAS_SAMPLES = 100;
          var GAS_P_SAMPLES = 100;
        
          LoadParams(obj.vals);
          var total_res = [ null, null];
          var res = new Array();
          res.push(["Gas Protein","Delta Gas"])
          for( var ii = 0; ii < GAS_SAMPLES ; ++ ii)
          {
            var delta_gas = GetGasRate();
            res.push([nowProteinGazQuantity, delta_gas]);
            nowProteinGazQuantity += 0.5;
          }
          total_res[0] = res;
          LoadParams(obj.vals);
          res = new Array();
          res.push(["Repressor","Delta Gas Protein"])
          for( var ii = 0; ii < GAS_P_SAMPLES ; ++ ii)
          {
            var delta_gas = GetProteinGazRate();
            res.push([nowRepressorQuantity, delta_gas]);
            nowRepressorQuantity += 0.5;
          }
          total_res[1] = res;
          
           postMessage({"command":"graph-gas" ,"vals":total_res});
        }
        else
        {
          postMessage({'command':'error', 'vals':'Unrecognized command'});
          Log("unrecognized command received");
        }
    }

    else
    {
      postMessage({'command':'error', 'vals':'Unformatted message'});
      Log("Unformatted message received");
    }
    
};
