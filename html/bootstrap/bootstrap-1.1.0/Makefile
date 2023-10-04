DATE=$(shell DATE)
BOOTSTRAP = ./dist/css/bootstrap-1.1.0.css
BOOTSTRAP_LESS = ./less/bootstrap.less
LESS_COMPESSOR ?= `which lessc`
WATCHR ?= `which watchr`

build:
	@@if test ! -z ${LESS_COMPESSOR}; \
	then \
		sed 's/@DATE/'"${DATE}"'/' ${BOOTSTRAP_LESS} >${BOOTSTRAP_LESS}.tmp; \
		lessc ${BOOTSTRAP_LESS}.tmp > ${BOOTSTRAP}; \
		rm -f ${BOOTSTRAP_LESS}.tmp; \
		echo "Bootstrap construído com sucesso ! - `date`"; \
	else \
		echo "Você deve ter o compilador LESS instalado para compilar o Bootstrap."; \
		echo "Você pode instalá-lo executando: npm install less -g"; \
	fi

watch:
	@@if test ! -z ${WATCHR}; \
	then \
		echo "Assistindo a arquivos less..."; \
		watchr -e "watch('less/.*\.less') { system 'make' }"; \
	else \
		echo "Você deve ter o watchr instalado para assistir aos arquivos Bootstrap less."; \
		echo "Você pode instalá-lo executando: gem install watchr"; \
	fi

.PHONY: build watch
