Bootstrap: docker

From: node:alpine

%runscript
   grupo=false
   debug=false
   usr="$USER"

   if [ $# -gt 0 ]; then
      case "$1" in
         --debug)
            debug=true
            shift 1
            ;;
      esac
   fi

   cd /app

   if [ $debug = true ]; then
      node main.js $@
   else
      uid=$(id -u $USER)
      if [ $uid -gt 5000 ] && [ $uid -lt 6001 ]
      then
         echo 'Investigador $usr'
         node main.js "$usr" $@ 
      else
         echo 'Colaborador $usr'
         node main.js "$usr" $@
      fi
   fi

%setup
   mkdir -p ${SINGULARITY_ROOTFS}/app


%files
   ./main.js app/main.js
   ./tabla.js app/tabla.js
   ./cpuline.js app/cpuline.js
   ./inftable.js app/inftable.js
   ./ramline.js app/ramline.js
   ./query.json app/query.json
   ./package.json app/package.json

%environment
   ES_SLURM_DB='148.206.50.80:9200'
   export ES_SLURM_DB
   TELEGRAF_DB='148.206.50.80:32785'
   export TELEGRAF_DB

%post 
   mkdir /LUSTRE
   touch /etc/localtime
   cd /app
   npm install
   chmod 775 /app/*
