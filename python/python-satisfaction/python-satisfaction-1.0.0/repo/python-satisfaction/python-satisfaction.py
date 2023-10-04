#
# Copyright (C) <ano>  Chifrudo <chifrudo@localhost.com.br>
#
# Este programa é um software livre: você pode redistribuí-lo e/ou
# modificá-lo sob os termos da GNU General Public License conforme
# publicada por a Free Software Foundation, seja a versão 3 da
# Licença, ou (a seu critério) qualquer versão posterior.
#
# Este programa é distribuído na esperança de que seja útil,
# mas SEM QUALQUER GARANTIA; mesmo sem a garantia implícita de
# COMERCIABILIDADE ou ADEQUAÇÃO PARA UM FIM ESPECÍFICO. Veja a
# Licença Pública Geral GNU para mais detalhes.
#
# Você deve ter recebido uma cópia da GNU General Public License
# juntamente com este programa. Caso contrário, consulte
# <https://www.gnu.org/licenses/>.
#

import os
import sys
import time
import curses
import calendar

from datetime import date
from dateutil.relativedelta import relativedelta


#
# Implementar:
#     - Descobrir lista de signos compativel com o signo da data de nascimento.
#     - Descobrir data correta para tornar signo compativel com o signo do alvo.
#


#
# Um shell interativo para opções do python-satisfaction.
#
class Shell:
    #
    # Um mapa com a lista de signos por data.
    #
    signo = None

    #
    # Construtor.
    #
    def __init__(self):
        self.signo = {
            #
            # Um label com a lista de cada signo com acentos.
            #
            "label": [
                "Áries",
                "Touro",
                "Gêmeos",
                "Câncer",
                "Leão",
                "Virgem",
                "Libra",
                "Escorpião",
                "Sagitário",
                "Capricórnio",
                "Aquário",
                "Peixes",
            ],

            #
            # A lista de signos disponível em ascii, e lowercase.
            #
            "list": [
                "aries",
                "touro",
                "gemeos",
                "cancer",
                "leao",
                "virgem",
                "libra",
                "escorpiao",
                "sagitario",
                "capricornio",
                "aquario",
                "peixes",
            ],

            #
            # A lista de compatibilidade por signo.
            #
            "compatibility": {
                #
                # A lista de compatibilidade do signo de: `Áries`.
                #
                "aries": [
                    "aries",
                    "touro",
                    "gemeos",
                    "cancer",
                    "leao",
                    "virgem",
                    "libra",
                    "escorpiao",
                    "sagitario",
                    "capricornio",
                    "aquario",
                    "peixes",
                ],

                #
                # A lista de compatibilidade do signo de: `Touro`.
                #
                "touro": [
                    "touro",
                    "gemeos",
                    "cancer",
                    "leao",
                    "virgem",
                    "libra",
                    "escorpiao",
                    "sagitario",
                    "capricornio",
                    "aquario",
                    "peixes"
                ],

                #
                # A lista de compatibilidade do signo de: `Gêmeos`.
                #
                "gemeos": [
                    "gemeos",
                    "cancer",
                    "leao",
                    "virgem",
                    "escorpiao",
                    "sagitario",
                    "capricornio",
                    "aquario",
                    "peixes"
                ],

                #
                # A lista de compatibilidade do signo de: `Câncer`.
                #
                "cancer": [
                    "cancer",
                    "leao",
                    "virgem",
                    "libra",
                    "escorpiao",
                    "sagitario",
                    "capricornio",
                    "aquario",
                    "peixes"
                ],

                #
                # A lista de compatibilidade do signo de: `Leão`.
                #
                "leao": [
                    "leao",
                    "virgem",
                    "libra",
                    "escorpiao",
                    "sagitario",
                    "capricornio",
                    "aquario",
                    "peixes"
                ],

                #
                # A lista de compatibilidade do signo de: `Virgem`.
                #
                "virgem": [
                    "virgem",
                    "libra",
                    "escorpiao",
                    "sagitario",
                    "capricornio",
                    "aquario",
                    "peixes"
                ],

                #
                # A lista de compatibilidade do signo de: `Libra`.
                #
                "libra": [
                    "libra",
                    "escorpiao",
                    "sagitario",
                    "capricornio",
                    "aquario",
                    "peixes"
                ],

                #
                # A lista de compatibilidade do signo de: `Escorpião`.
                #
                "escorpiao": [
                    "escorpiao",
                    "sagitario",
                    "capricornio",
                    "aquario",
                    "peixes"
                ],

                #
                # A lista de compatibilidade do signo de: `Sagitário`.
                #
                "sagitario": [
                    "sagitario",
                    "capricornio",
                    "aquario",
                    "peixes"
                ],

                #
                # A lista de compatibilidade do signo de: `Capricórnio`.
                #
                "capricornio": [
                    "capricornio",
                    "aquario",
                    "peixes"
                ],

                #
                # A lista de compatibilidade do signo de: `Aquário`.
                #
                "aquario": [
                    "aquario",
                    "peixes"
                ],

                #
                # A lista de compatibilidade do signo de: `Peixes`.
                #
                "peixes": [
                    "peixes"
                ]
            },

            #
            # A lista de signos disponível em ascii, e lowercase,
            # com o id do nome correto no vetor.
            #
            "map": {
                "aries": 0,
                "touro": 1,
                "gemeos": 2,
                "cancer": 3,
                "leao": 4,
                "virgem": 5,
                "libra": 6,
                "escorpiao": 7,
                "sagitario": 8,
                "capricornio": 9,
                "aquario": 10,
                "peixes": 11,
            },

            #
            # A lista de `entrês` para descobrir o signo de uma
            # pessoa.
            #
            "ranges": [
                #
                # Signo,        Dia, Mês, -> Dia, Mês.
                #
                ["aries",       21,    3,     20,  4], # 21 de março     a 20 de abril.
                ["touro",       21,    4,     20,  5], # 21 de abril     a 20 de maio.
                ["gemeos",      21,    5,     20,  6], # 21 de maio      a 20 de junho.
                ["cancer",      21,    6,     22,  7], # 21 de junho     a 22 de julho.
                ["leao",        23,    7,     22,  8], # 23 de julho     a 22 de agosto.
                ["virgem",      23,    8,     22,  9], # 23 de agosto    a 22 de setembro.
                ["libra",       23,    9,     22, 10], # 23 de setembro  a 22 de outubro.
                ["escorpiao",   23,   10,     21, 11], # 23 de outubro   a 21 de novembro.
                ["sagitario",   22,   11,     21, 12], # 22 de novembro  a 21 de dezembro.
                ["capricornio", 22,   12,     20,  1], # 22 de dezembro  a 20 de janeiro.
                ["aquario",     21,    1,     18,  2], # 21 de janeiro   a 18 de fevereiro.
                ["peixes",      19,    2,     20,  3], # 19 de fevereiro a 20 de março.
            ]
        }

    #
    # Descobrir o signo usando um numero em dia, mês.
    #
    # @param int day   - O número do dia.
    # @param int month - O número do mês.
    # @return dict     - Os detalhes do signo encontrado.
    #
    def discover_signo(self, day, month):
        now = date.today()
        year = now.year

        #
        # A lista de endereços inicializados com zero.
        #
        mounth_undo = 0
        mounth_current = 0
        mounth_next = 0

        #
        # A quantidade de dias do mês atual.
        #
        mounth_current = calendar.monthrange(year, month)[1]

        #
        # Enquanto não ultrapassar o limite do mês um.
        #
        if month - 1 >= 1:
            #
            # A quantidade de dias do mês anterior.
            #
            mounth_undo = calendar.monthrange(year, month - 1)[1]
        else:
            #
            # A quantidade de dias do mês, do ano passado.
            #
            mounth_undo = calendar.monthrange(year - 1, 12)[1]

        #
        # Enquanto não ultrapassar o limite de 12 mêses.
        #
        if month + 1 <= 12:
            #
            # A quantidade de dias do próximo mês.
            #
            mounth_next = calendar.monthrange(year, month + 1)[1]
        else:
            #
            # A quantidade de dias do mês, do próximo ano.
            #
            mounth_next = calendar.monthrange(year + 1, 1)[1]

        for pos in range(0, len(self.signo["list"])):
            signo_current_id = pos
            signo_current_nick = self.signo["list"][signo_current_id]
            signo_current_name = self.signo["label"][signo_current_id]
            signo_current_range = self.signo["ranges"][signo_current_id]

            #
            # O alvo está entre o primeiro mês ?
            # Questão: Um boolean com true ou false.
            #
            first = [
                day >= signo_current_range[1],
                month >= signo_current_range[2],
            ] == [True, True]

            #
            # O alvo está entre o último mês ?
            # Questão: Um boolean com true ou false.
            #
            last = [
                day <= signo_current_range[3],
                month <= signo_current_range[4]
            ] == [True, True]

            #
            # A data alvo está entre a primeira ou segunda
            # combinação de datas de signos ?
            #
            if first or last:
                #
                # Encontrou o signo compativel com o dia e mês especificado,
                # vamos devolver um dict.
                #
                return {
                    "id": signo_current_id,
                    "nick": signo_current_nick,
                    "name": signo_current_name,
                }

        #
        # Caso encontre alguma falha, vamos devolver um dict
        # com informações de desconhecido. Caso venha a acontecer,
        # é legal revisar essa função. Mas acredito que não vá
        # acontecer esse tipo de erro.
        #
        return {
            "id": 0,
            "nick": "unknow",
            "name": "Unknow"
        }

    #
    # A introdução do programa.
    #
    def introduction(self):
        print(
            "python-satisfaction: 1.0.0\n"
            "Descobrir compatibilidade com signo de uma pessoa do sexo\n"
            "feminino, via horóscopo."
        )

    #
    # A lista de opções compativeis com esse programa.
    #
    def options(self):
        print(
            "Opções: \n"
            "    [stab] - A tabela de compatibilidade de signos.\n"
            "    [sfil] - Descobrir o signo do filho(a).\n"
            "    [snas] - Obter signo via data de nascimento.\n"
            "    [snow] - Obter o signo do mês atual.\n"
            "    [help] - Chame esse ajudante novamente.\n"
            "    [clsh] - Limpar as informações do shell.\n"
            "    [exit] - Fechar esse programa."
            "\n"
        )

    #
    # Fechar esse programa.
    #
    def option_close(self):
        print("Tchau !")
        sys.exit(0)

    #
    # Chame esse ajudante novamente.
    #
    def option_help(self):
        self.options()

    #
    # Limpar as informações do shell.
    #
    def option_clsh(self):
        os.system("clear")
        self.option_help()

    #
    # Obter o signo do mês atual.
    #
    def option_snow(self):
        now = date.today()
        day = now.day
        month = now.month
        year = now.year

        print(
            "O signo desse mês é: {0} - [{1}/{2}/{3}]".format(
                shell.discover_signo(day, month)["name"],
                day,
                month,
                year
            )
        )

    #
    # Obter signo via data de nascimento.
    #
    def option_snas(self):
        print("Por favor, informe sua data de nascimento...")

        day   = int(input("$ [dia]: "))
        month = int(input("$ [mês]: "))

        if input("$ Você deseja informar seu ano de nascimento ?\n$ (y/n)[n]: ").lower() == "y":
            now = date.today()
            year = int(input("$ [ano]: "))

            #
            # Vamos informar o signo da pessoa.
            #
            print(
                "Seu signo é: {0} - [{1}/{2}/{3}]".format(
                    shell.discover_signo(day, month)["name"],
                    day,
                    month,
                    year
                )
            )

            #
            # Vamos informar a idade atual da pessoa.
            #
            print(
                "Você tem aproximadamente: {0} anos.".format(
                    abs(year - now.year)
                )
            )
        else:
            #
            # Vamos informar o signo da pessoa.
            #
            print(
                "Seu signo é: {0} - [{1}/{2}]".format(
                    shell.discover_signo(day, month)["name"],
                    day,
                    month
                )
            )

    #
    # Descobrir o signo do filho(a).
    #
    def option_sfil(self):
        print(
            "Descobrir o signo do seu próximo filho(a)\n"
            "caso tenha uma relação hoje. O calculo é feito\n"
            "com a data atual [x](vezes) [9](nove) meses.\n"
        )

        now = date.today()
        new = date(now.year, now.month, now.day)
        new = new + relativedelta(months = 9)

        year = new.year
        month = new.month
        day = new.day

        #
        # Vamos informar o signo da pessoa.
        #
        print(
            "O signo do seu filho(a) vai ser: {0} - [{1}/{2}/{3}]".format(
                shell.discover_signo(day, month)["name"],
                day,
                month,
                year
            )
        )

    #
    # A tabela de compatibilidade de signos.
    #
    def option_stab(self):
        #
        # Transforme um nome de signo em ascii, para:
        #     [`UTF-8`] ou
        #     [`ISO-8859-1`].
        #
        # @param string  nick  O nome do signo
        # @return string signo O nome do signo em iso-8859-1 [pt-br].
        #
        def daemon(nick):
            #
            # A posição inicial.
            #
            pos = 0

            #
            # Vamos correr o vetor para encontrar a posição.
            #
            for i in range(0, len(self.signo["list"])):
                #
                # Verificação durante essa iteração.
                #
                if self.signo["list"][i] == nick:
                    #
                    # Vamos salvar a posição para obter a étiqueta do
                    # signo via comparação entre dois vetores.
                    #
                    pos = i

                    #
                    # Então, pare !
                    #
                    break

            #
            # Devolver a étiqueta do signo.
            #
            return self.signo["label"][pos]

        print("A tabela de compatibilidade de signos:")

        for i in range(0, len(self.signo["compatibility"])):
            current = self.signo["list"][i]
            vector = self.signo["compatibility"][self.signo["list"][i]]

            #
            # Enviar o signo atual.
            #
            print(
                "    {0}:".format(
                    #
                    # Invocar uma função demônio de serviço.
                    #
                    daemon(current)
                )
            )

            #
            # Enquanto...
            #
            for x in range(0, len(vector)):
                #
                # Enviar signo compatível com atual.
                #
                print(
                    "        {0}".format(
                        #
                        # Invocar uma função demônio de serviço.
                        #
                        daemon(vector[x])
                    )
                )

            #
            # Nova linha ao fim dessa volta.
            #
            print()

        #
        # Enviar uma nova linha ao console.
        #
        print()

    #
    # Um e/s interativo.
    #
    def interactive(self):
        while True:
            option = input("$: ")

            if option == "exit":
                self.option_close()

            if option == "help":
                self.option_help()

            if option == "clsh":
                self.option_clsh()

            if option == "snow":
                self.option_snow()

            if option == "snas":
                self.option_snas()

            if option == "sfil":
                self.option_sfil()

            if option == "stab":
                self.option_stab()

            #
            # print(option).
            #

#
# Método main.
#
if __name__ == '__main__':
    #
    # Um objeto de console interativo para um serviço
    # com python-satisfaction.
    #
    shell = Shell()
    shell.introduction()
    shell.options()
    shell.interactive()
