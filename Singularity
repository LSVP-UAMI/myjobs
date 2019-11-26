Bootstrap: docker

From: node:buster-slim

%runscript
   uid=$(id -u $USER)
   if [ $uid -gt 5000 ] && [ $uid -lt 6001 ]
   then
      cd /myjobs
      node main.js -g $USER 2> /dev/null
   else
      echo Acceso denegado
   fi

%setup
   mkdir -p ${SINGULARITY_ROOTFS}/myjobs


%files
   ./main.js myjobs/main.js
   ./tabla.js myjobs/tabla.js
   ./cpuline.js myjobs/cpuline.js
   ./inftable.js myjobs/inftable.js
   ./ramline.js myjobs/ramline.js
   ./query.json myjobs/query.json
   ./package.json myjobs/package.json

%post 
   cd /myjobs
   touch ./err.log
   npm install
