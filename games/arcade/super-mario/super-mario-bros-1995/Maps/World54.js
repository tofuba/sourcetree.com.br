/**
 * Copyright (C) <ano>  Chifrudo <chifrudo@localhost.com.br>
 *
 * Este programa é um software livre: você pode redistribuí-lo e/ou
 * modificá-lo sob os termos da GNU General Public License conforme
 * publicada por a Free Software Foundation, seja a versão 3 da
 * Licença, ou (a seu critério) qualquer versão posterior.
 *
 * Este programa é distribuído na esperança de que seja útil,
 * mas SEM QUALQUER GARANTIA; mesmo sem a garantia implícita de
 * COMERCIABILIDADE ou ADEQUAÇÃO PARA UM FIM ESPECÍFICO. Veja a
 * Licença Pública Geral GNU para mais detalhes.
 *
 * Você deve ter recebido uma cópia da GNU General Public License
 * juntamente com este programa. Caso contrário, consulte
 * <https://www.gnu.org/licenses/>.
 */


map.time = 300;
map.locs = [
    new Location(0, startCastle)
];

map.areas = [
    new Area("Castle", function()
    {
        setLocationGeneration(0);

        startCastleInside();

        makeCeilingCastle(40, 11, 3);
        pushPreFloor(40, 24, 11);

        fillPreWater(128, 0, 32);
        pushPreThing(Podoboo, 128, -32);
        pushPreThing(Stone, 144, 32, 2, 1);
        pushPreThing(Podoboo, 160, -24);
        pushPreThing(Stone, 176, 48, 3, 1);
        pushPreThing(CastleBlock, 184, 48, 12, true);
        pushPreThing(Block, 184, 80, Mushroom);
        pushPreThing(Stone, 216, 32, 2, 1);
        pushPreThing(Podoboo, 240, -32);

        pushPreFloor(256, 0, 52);
        pushPreThing(Stone, 256, 24, 2, 3);
        makeCeilingCastle(272, 49, 4);
        pushPreThing(Stone, 296, jumplev1, 36, 1);
        pushPreThing(CastleBlock, 344, 0, 6, true);
        pushPreThing(CastleBlock, 392, jumplev1, 6);
        pushPreThing(CastleBlock, 440, 0, 6, true);
        pushPreThing(CastleBlock, 440, jumplev2);
        pushPreThing(CastleBlock, 488, jumplev1, 6);
        pushPreThing(CastleBlock, 536, 0, 6);
        pushPreThing(CastleBlock, 584, jumplev1, 6);
        pushPreThing(Stone, 640, 24, 4, 3)
        pushPreThing(CastleBlock, 656, 56, 6);

        pushPrePlatformGenerator(686, 3, -1);
        pushPrePlatformGenerator(710, 3, 1);

        pushPreFloor(736, 16);
        pushPreThing(CastleBlock, 736, 24, 6, true);
        pushPreFloor(744, 24, 6);
        makeCeilingCastle(744, 6, 3);
        pushPreFloor(792, 0, 10);
        fillPreThing(Coin, 817, 7, 3, 2, 8, 32);
        pushPreThing(CastleBlock, 824, 16, 6, -1.17);
        fillPreWater(872, 0, 4);
        pushPreThing(Stone, 864, 24, 1, 3);
        pushPreThing(Podoboo, 872, -32);
        pushPreFloor(888, 24, 2);
        fillPreWater(904, 0, 4);

        pushPreFloor(920, 0, 13);
        pushPreThing(Stone, 920, 24, 5, 3);
        makeCeilingCastle(920, 13, 3);
        fillPreThing(Stone, 976, 24, 2, 1, 32, 0, 2, 3);
        pushPreThing(Podoboo, 904, -32);

        fillPreThing(Brick, 1024, 64, 6, 1, 8);
        endCastleInside(1024);
        pushPreThing(Podoboo, 1048, -40);
    })
];
