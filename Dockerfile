FROM ubuntu:20.04

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y build-essential ghostscript libpng-dev libgd-dev fontconfig libgs-dev libpango1.0-dev libexpat-dev wget tar curl git

ADD fonts /usr/local/share/fonts/

RUN fc-cache -f -v && \
    fc-list

RUN curl -fsSL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

ADD sketchviz /sketchviz/

RUN cd /sketchviz && \
    npm install

RUN apt-get install -y ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

RUN wget -O - https://gitlab.com/graphviz/graphviz/-/package_files/7097037/download | tar Jxv -C /tmp && \
    cd /tmp/graphviz-2.46.1 && \
    ./configure --enable-swig=no && make && make install && \
    cd / && \
    rm -rf /tmp/graphviz-2.46.1
