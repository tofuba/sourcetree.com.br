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


map.locs = [
    /**
     * 0: Entrada principal.
     */
    new Location(0, true),

    /**
     * 1: Sair do primeiro submundo.
     */
    new Location(0, exitPipeVert),

    /**
     * 2: Sair debaixo d'água.
     */
    new Location(0, exitPipeVert),

    /**
     * 3: Sair do mundo da nuvem.
     */
    new Location(0, false, 1304),

    /**
     * 4: Sair do segundo submundo.
     */
    new Location(0, exitPipeVert),

    /**
     * 5: Entre no primeiro submundo.
     */
    new Location(1),

    /**
     * 6: Entrar debaixo d'água.
     */
    new Location(2),

    /**
     * 7: Entrar no céu.
     */
    new Location(3, enterCloudWorld),

    /**
     * 8: Entre no segundo submundo.
     */
    new Location(4)
];

map.areas = [
    new Area("Overworld Night", function()
    {
        setLocationGeneration(0);

        pushPreCastle();
        pushPrePattern("backreg", 0, 0, 5);
        pushPreFloor(0, 0, 123);
        fillPreThing(Brick, 80, jumplev1, 3, 1, 8);

        /**
         * Entre no primeiro submundo.
         */
        pushPrePipe(152, 0, 32, true, 5);

        pushPreThing(Brick, 184, jumplev2);
        pushPreThing(Block, 192, jumplev1, Coin, true);
        pushPreThing(Brick, 192, jumplev2, Coin);
        pushPreThing(Brick, 200, jumplev2);
        pushPreThing(Koopa, 208, 12);
        pushPrePipe(224, 0, 32, true);
        pushPreThing(Stone, 256, 40, 2);
        pushPrePipe(256, 40, 16, true);

        /**
         * Sair primeiro submundo.
         */
        pushPrePipe(280, 0, 16, true, false, 1);

        pushPrePipe(296, 0, 16, true);
        pushPreThing(Koopa, 344, 32, false, true);
        pushPrePipe(368, 0, 32, true);
        pushPreThing(Brick, 408, jumplev1);
        pushPreThing(Brick, 416, jumplev1, Mushroom);
        pushPreThing(Beetle, 432, 8.5);

        /**
         * Entrar debaixo d'água.
         */
        pushPrePipe(448, 0, 40, true, 6);

        pushPreThing(Stone, 496, jumplev1, 2);
        pushPrePipe(496, jumplev1, 16, true);
        pushPrePipe(536, 0, 16, true);
        fillPreThing(Brick, 536, jumplev2, 5, 1, 8);
        pushPreThing(Goomba, 536, 72);
        pushPrePipe(592, 0, 16, true);
        fillPreThing(Brick, 616, jumplev2, 4, 1, 8);
        pushPrePipe(640, 0, 24, true);

        /**
         * Entre no mundo da nuvem.
         */
        pushPreThing(Brick, 648, jumplev2, [Vine, 7]);

        pushPreThing(Block, 656, jumplev1, Coin, true);
        pushPrePipe(672, 0, 16, true);
        pushPrePipe(696, 0, 48, true);
        pushPreThing(Beetle, 736, 8.5);
        pushPrePipe(752, 0, 24, true);
        pushPrePipe(816, 0, 32);
        pushPrePipe(840, 0, 16, true);
        fillPreThing(Brick, 880, jumplev1, 2, 1, 24);
        pushPreThing(Stone, 888, jumplev1, 2);
        pushPrePipe(888, jumplev1, 24, true);

        /**
         * Sair debaixo d'água.
         */
        pushPrePipe(920, 0, 16, true, false, 2);

        pushPreThing(Brick, 920, jumplev2);
        fillPreThing(Brick, 952, jumplev2, 9, 1, 8);
        pushPreThing(Beetle, 960, 72.5);

        pushPreFloor(1032, 0, 12);
        pushPrePipe(1048, 0, 16, true);
        pushPrePipe(1080, 0, 16, true);
        fillPreThing(Brick, 1104, 40, 2, 1, 8);
        pushPreThing(Brick, 1120, 64, Star);
        pushPreThing(Brick, 1128, 64);
        pushPreFloor(1136, 0, 1);

        pushPreFloor(1152, 0, 8);
        fillPreThing(Brick, 1152, jumplev1, 3, 1, 8);
        fillPreThing(Brick, 1160, jumplev2, 2, 1, 8);
        pushPreThing(Stone, 1192, 8);
        pushPreThing(Stone, 1200, 16, 1, 2);
        pushPreThing(Stone, 1208, 24, 1, 3);

        pushPreFloor(1224, 0, 87);

        /**
         * Entre no segundo submundo.
         */
        pushPrePipe(1224, 0, 24, true, 8);

        pushPreThing(Stone, 1248, 32, 1, 4);
        pushPreThing(Stone, 1256, 16, 1, 2);
        fillPreThing(Brick, 1280, jumplev1, 3, 2, 8, 32);
        pushPreThing(Beetle, 1304, 8.5);
        pushPreThing(Stone, 1336, jumplev1, 2);
        pushPrePipe(1336, jumplev1, 24, true);
        pushPreThing(Goomba, 1352, 8);
        pushPrePipe(1392, 0, 32, true);

        /**
         * Sair do segundo submundo.
         */
        pushPrePipe(1432, 0, 16, true, false, 4);

        pushPrePipe(1448, 0, 24, true);
        pushPrePipe(1464, 0, 32, true);
        pushPrePipe(1512, 0, 24, true);
        pushPreThing(Stone, 1592, 8);
        pushPreThing(Stone, 1600, 16, 1, 2);
        pushPrePipe(1608, 0, 32, true);
        pushPreThing(Stone, 1624, 40, 1, 5);
        pushPreThing(Stone, 1632, 48, 1, 6);
        pushPreThing(Stone, 1640, 56, 1, 7);
        pushPreThing(Stone, 1648, 64, 2, 8);
        pushPreThing(Koopa, 1648, 84, false, true);
        endCastleOutside(1724);
    }),

    new Area("Underworld", function()
    {
        /**
         * Primeiro submundo.
         */

        setLocationGeneration(5);

        makeCeiling(32, 7);
        pushPreFloor(0, 0, 17);
        fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
        fillPreThing(Brick, 32, 48, 7, 1, 8);
        pushPreThing(Brick, 32, 56);
        fillPreThing(Coin, 42, 55, 5, 2, 8, 8);
        fillPreThing(Brick, 80, 56, 1, 4, 8, 8);
        fillPreThing(Brick, 88, 56, 2, 1, 8);
        pushPreThing(Brick, 112, 48, Coin);
        pushPreThing(PipeSide, 104, 16, 1);
        pushPreThing(PipeVertical, 120, 88, 88);
    }),

    new Area("Underwater", function()
    {
        /**
         * Embaixo da agua.
         */

        setLocationGeneration(6);
        goUnderWater();

        pushPreFloor(0, 0, 22);
        pushPreThing(Stone, 88, 56, 5);
        pushPreThing(Coral, 96, 24, 3);
        pushPreThing(Coral, 120, 72, 2);
        pushPreThing(Blooper, 136, 24);
        pushPreThing(Coral, 160, 32, 4);
        fillPreThing(Coin, 177, 47, 10, 1, 8, 8);

        pushPrePlatformGenerator(186, 4, 1);
        pushPreFloor(208, 24, 2);
        pushPreThing(Stone, 208, 88, 2, 3);
        pushPreThing(CheepCheep, 220, 60);
        pushPrePlatformGenerator(234, 4, 1);
        pushPreFloor(256, 24, 2);
        pushPreThing(Stone, 256, 88, 2, 3);
        pushPreFloor(272, 0, 4);
        pushPreThing(Blooper, 272, 24);

        pushPreThing(Coral, 304, 64, 4);
        pushPreThing(Stone, 304, 72, 6);
        pushPreThing(CheepCheep, 312, 20);
        pushPreFloor(320, 0, 2);
        fillPreThing(Coin, 321, 7, 2, 1, 8);
        pushPreThing(Coral, 344, 64, 4);
        pushPreThing(Blooper, 348, 22);
        pushPreFloor(352, 0, 21);
        pushPreThing(Coral, 368, 16, 2);

        pushPreThing(CheepCheep, 388, 40, true);
        pushPreThing(Stone, 400, 32, 4);
        fillPreThing(Coin, 401, 39, 4, 1, 8);
        pushPreThing(CheepCheep, 424, 84);
        pushPreThing(Stone, 432, 56, 4);
        fillPreThing(Coin, 433, 63, 4, 1, 8);

        pushPreThing(Stone, 472, 8);
        pushPreThing(Stone, 480, 16, 1, 2);
        pushPreThing(Stone, 488, 32, 2, 4);
        pushPreThing(Stone, 488, 88, 2, 4);
        pushPreThing(PipeSide, 496, 48, 2);
        pushPreThing(Stone, 504, 88, 2, 11);
    }),

    new Area("Sky Night", function()
    {
        /**
         * Mundo da nuvem.
         */

        setLocationGeneration(7);

        pushPreThing(Stone, 0, 0, 4);
        pushPreThing(Stone, 40, 0, 78);
        pushPreThing(Platform, 128, 24, 6, collideTransport);
        fillPreThing(Coin, 121, 55, 16, 1, 8);
        pushPreThing(Stone, 256, 40);
        fillPreThing(Coin, 273, 55, 16, 1, 8);
        pushPreThing(Stone, 408, 48, 1, 2);
        fillPreThing(Coin, 425, 63, 7, 1, 8);
        pushPreThing(Stone, 488, 48, 1, 2);
        pushPreThing(Stone, 536, 56, 2);
        fillPreThing(Stone, 568, 56, 5, 1, 16);
        fillPreThing(Coin, 569, 63, 10, 1, 8);
        fillPreThing(Coin, 681, 15, 3, 1, 8);

        setExitLoc(3);
    }),

    new Area("Underworld", function()
    {
        /**
         * Segundo submundo.
         */

        setLocationGeneration(8);

        makeCeiling(32, 11);
        pushPreFloor(0, 0, 17);
        fillPreThing(Brick, 0, 8, 1, 11, 8, 8);
        fillPreThing(Brick, 24, 16, 1, 3, 8, 8);
        fillPreThing(Coin, 25, 39, 8, 1, 8);
        fillPreThing(Coin, 25, 7, 10, 1, 8);
        fillPreThing(Brick, 32, 32, 6, 1, 8);
        fillPreThing(Brick, 80, 16, 1, 3, 8, 8);
        pushPreThing(PipeSide, 104, 16, 4);
        pushPreThing(Brick, 104, 32, Mushroom);
        pushPreThing(PipeVertical, 120, 88, 88);
    })
];
