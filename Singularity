Bootstrap: docker

From: node:alpine

%runscript
   grupo=false 
   opt="$USER"

   if [ $# -gt 0 ]; then
      case "$1" in
         -h|--help)
            node main.js --help
            exit 1
            ;;
         -g|--group)
            grupo=true
            opt="-g $opt"
            shift
            ;;
         *)
            echo  "La opcion $1 es invalida."
            node main.js --help
            exit 1
            ;;
      esac
   fi

   uid=$(id -u $USER)

   if [ $uid -gt 5000 ] && [ $uid -lt 6001 ]
   then
      cd /app
      node main.js "$opt" 2> /dev/null
   else
      if [ "$grupo" = true ]; then
         echo 'Las opciones -g y --group son solo para investigadores.'
         node main.js --help
         exit 1
      fi
      echo Acceso denegado
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
   cd /app
   npm install
