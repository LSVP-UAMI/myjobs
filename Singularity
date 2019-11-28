Bootstrap: docker

From: node:buster-slim

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
      cd /myjobs
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
   npm install
