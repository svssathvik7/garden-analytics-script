function a0_0x87e7(){const _0x18ee3a=['brave\x20wallet','BACKEND_TRAFFIC_API','isPhantom','script\x20loaded','540wLSFxR','[TrafficSource]\x20Sending\x20payload:','then','setItem','231819kvFBcB','okx\x20wallet','log','Direct','location','6Qivmdl','isBraveWallet','[TrafficSource]\x20Error:','env','POST','isMetaMask','354644yrUwZx','8ykXHKK','rabby\x20wallet','getItem','HTTP\x20error!\x20status:\x20','122314ZjEicA','stringify','121dCyvZK','unisat','eth_accounts','Referrer','href','2XegGIS','BACKEND_WALLET_API','[WalletData]\x20Sending\x20payload:','1941312tKpxQZ','ethereum','isOKXWallet','json','catch','application/json','length','3882czGhaS','referrer','status','request','737361ElqCnk','[WalletData]\x20Response\x20data:','[TrafficSource]\x20Response\x20status:','error','224190NEUril'];a0_0x87e7=function(){return _0x18ee3a;};return a0_0x87e7();}const a0_0x3a9de9=a0_0x8868;(function(_0x35e9a7,_0x4a8acf){const _0x5c6d05=a0_0x8868,_0x2ca02f=_0x35e9a7();while(!![]){try{const _0x41186d=parseInt(_0x5c6d05(0x14e))/0x1*(-parseInt(_0x5c6d05(0x155))/0x2)+-parseInt(_0x5c6d05(0x143))/0x3*(parseInt(_0x5c6d05(0x149))/0x4)+parseInt(_0x5c6d05(0x13a))/0x5*(parseInt(_0x5c6d05(0x15f))/0x6)+parseInt(_0x5c6d05(0x13e))/0x7+-parseInt(_0x5c6d05(0x14a))/0x8*(parseInt(_0x5c6d05(0x131))/0x9)+parseInt(_0x5c6d05(0x135))/0xa*(parseInt(_0x5c6d05(0x150))/0xb)+parseInt(_0x5c6d05(0x158))/0xc;if(_0x41186d===_0x4a8acf)break;else _0x2ca02f['push'](_0x2ca02f['shift']());}catch(_0x42a31d){_0x2ca02f['push'](_0x2ca02f['shift']());}}}(a0_0x87e7,0x1fb15));const TrafficSourceType={'Referrer':a0_0x3a9de9(0x153),'Direct':a0_0x3a9de9(0x141)},createTrafficSource={'referrer':_0x4fbb53=>({'Referrer':{'platform':_0x4fbb53}}),'direct':()=>({'Direct':null})},trackTrafficSource=async()=>{const _0xe3cf9=a0_0x3a9de9,_0x4b4305=localStorage[_0xe3cf9(0x14c)](_0xe3cf9(0x160)),_0x18657f=document['referrer'];if(!_0x4b4305){let _0x295cdf;_0x18657f==''?(localStorage[_0xe3cf9(0x13d)](_0xe3cf9(0x160),_0xe3cf9(0x141)),_0x295cdf=createTrafficSource['direct']()):(localStorage[_0xe3cf9(0x13d)](_0xe3cf9(0x160),_0x18657f),_0x295cdf=createTrafficSource[_0xe3cf9(0x160)](_0x18657f));let _0x2c8e59={'source_type':_0x295cdf,'url':window['location'][_0xe3cf9(0x154)]};console['log'](_0xe3cf9(0x13b),_0x2c8e59),fetch(''+process[_0xe3cf9(0x146)][_0xe3cf9(0x137)],{'method':_0xe3cf9(0x147),'headers':{'Content-Type':_0xe3cf9(0x15d)},'body':JSON[_0xe3cf9(0x14f)](_0x2c8e59)})[_0xe3cf9(0x13c)](_0x303a08=>{const _0x1a0c77=_0xe3cf9;return console[_0x1a0c77(0x140)](_0x1a0c77(0x133),_0x303a08[_0x1a0c77(0x161)]),_0x303a08;})['catch'](_0x2bc53d=>{const _0x1e115d=_0xe3cf9;console[_0x1e115d(0x134)](_0x1e115d(0x145),_0x2bc53d);});}},getWalletType=()=>{const _0x247177=a0_0x3a9de9;if(!window[_0x247177(0x159)])return null;if(window[_0x247177(0x159)][_0x247177(0x148)])return'metamask';if(window['ethereum'][_0x247177(0x144)])return _0x247177(0x136);if(window[_0x247177(0x159)][_0x247177(0x138)])return'phantom';if(window['ethereum']['isCoinbaseWallet'])return'coinbase\x20wallet';if(window[_0x247177(0x159)][_0x247177(0x15a)])return _0x247177(0x13f);if(window['ethereum']['isRabby'])return _0x247177(0x14b);if(window[_0x247177(0x151)])return _0x247177(0x151);return'browser\x20wallet';},sendWalletData=async _0x36fe3e=>{const _0x26b2d2=a0_0x3a9de9;if(!window[_0x26b2d2(0x159)])return;try{const _0x5eb138=await window['ethereum'][_0x26b2d2(0x162)]({'method':_0x26b2d2(0x152)}),_0x1ea0bc=_0x5eb138&&_0x5eb138[_0x26b2d2(0x15e)]>0x0;if(_0x1ea0bc&&_0x36fe3e){const _0x38b6bc=localStorage[_0x26b2d2(0x14c)](_0x26b2d2(0x160))||_0x26b2d2(0x141),_0x2a6ab1={'wallet_address':_0x36fe3e,'source':{'source_type':_0x38b6bc,'url':window[_0x26b2d2(0x142)][_0x26b2d2(0x154)]},'wallet_type':getWalletType()};console[_0x26b2d2(0x140)](_0x26b2d2(0x157),_0x2a6ab1);const _0x20c217=await fetch(''+process['env'][_0x26b2d2(0x156)],{'method':'POST','headers':{'Content-Type':'application/json'},'body':JSON[_0x26b2d2(0x14f)](_0x2a6ab1)});console[_0x26b2d2(0x140)]('[WalletData]\x20Response\x20status:',_0x20c217['status']);if(!_0x20c217['ok'])throw new Error(_0x26b2d2(0x14d)+_0x20c217[_0x26b2d2(0x161)]);const _0x290932=await _0x20c217[_0x26b2d2(0x15b)]();console[_0x26b2d2(0x140)](_0x26b2d2(0x132),_0x290932);}else{}}catch(_0x519707){}};function a0_0x8868(_0x3bee65,_0x53bd1d){const _0x87e722=a0_0x87e7();return a0_0x8868=function(_0x8868c5,_0x17544c){_0x8868c5=_0x8868c5-0x131;let _0x5c860a=_0x87e722[_0x8868c5];return _0x5c860a;},a0_0x8868(_0x3bee65,_0x53bd1d);}((()=>{const _0xaa6856=a0_0x3a9de9;console[_0xaa6856(0x140)](_0xaa6856(0x139)),trackTrafficSource(),window[_0xaa6856(0x159)]&&(window[_0xaa6856(0x159)]['request']({'method':_0xaa6856(0x152)})[_0xaa6856(0x13c)](_0x556f8f=>{const _0x26f862=_0xaa6856;_0x556f8f[_0x26f862(0x15e)]>0x0&&sendWalletData(_0x556f8f[0x0]);})[_0xaa6856(0x15c)](_0x2f2feb=>{}),window[_0xaa6856(0x159)]['on']('accountsChanged',_0x259566=>{const _0x3513ab=_0xaa6856;_0x259566[_0x3513ab(0x15e)]>0x0&&sendWalletData(_0x259566[0x0]);}));})());