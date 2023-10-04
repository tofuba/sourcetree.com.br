BOOTSTRAP
=========

Bootstrap é o kit de ferramentas para iniciar CSS para
sites, aplicativos e muito mais. Inclui estilos CSS
básicos para tipografia, formulários, botões, tabelas,
grades, navegação, alertas e muito mais.

Para começar -- checkout http://www.getbootstrap.com.br/1.1.0/index.html!


Uso
---

Você pode usar o Bootstrap de duas maneiras: basta soltar o CSS
compilado em qualquer novo projeto e começar a trabalhar, ou
executar o LESS em seu site e compilar rapidamente como um
chefe.

Aqui está a aparência da versão LESS:

    <link rel="stylesheet/less" type="text/css" href="less/bootstrap.less">
    <script type="text/javascript" src="less.js"></script>

Ou se preferir, o caminho CSS padrão:

    <link rel="stylesheet" type="text/css" href="bootstrap-1.1.1.css">

Para mais informações, consulte os documentos !


Relatando erros
---------------

Por favor, crie um problema aqui em GitHub ! :P


Desenvolvedores
---------------

Incluímos um makefile com métodos convenientes para trabalhar
com a biblioteca bootstrap.

+ **build** - `make build`
Isso executará o compilador less na biblioteca bootstrap
e gerará um arquivo bootstrap.css e bootstrap.min.css.
O compilador lessc é necessário para que este comando
seja executado.

+ **watch** - `make watch`
Este é um método conveniente para assistir seus arquivos
less e construí-los automaticamente sempre que você
salvar. O Watchr é necessário para que este comando
seja executado.


AUTHORS
-------

**Chifrudo - chifrudo@localhost.com.br**

+ http://getbootstrap.com.br/


Copyright e License
-------------------


Copyright (C) <ano>  Chifrudo <chifrudo@localhost.com.br>

Este programa é um software livre: você pode redistribuí-lo e/ou
modificá-lo sob os termos da GNU General Public License conforme
publicada por a Free Software Foundation, seja a versão 3 da
Licença, ou (a seu critério) qualquer versão posterior.

Este programa é distribuído na esperança de que seja útil,
mas SEM QUALQUER GARANTIA; mesmo sem a garantia implícita de
COMERCIABILIDADE ou ADEQUAÇÃO PARA UM FIM ESPECÍFICO. Veja a
Licença Pública Geral GNU para mais detalhes.

Você deve ter recebido uma cópia da GNU General Public License
juntamente com este programa. Caso contrário, consulte
<https://www.gnu.org/licenses/>.
