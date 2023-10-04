<?php

    /**
     * Redbean PHP - Versão 5.7.4.
     *
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


    /**
     *
     */
    namespace RedBeanPHP
    {
        /**
         * Interface de registro RedBean.
         * Fornece uma interface de registro uniforme e conveniente
         * em todo o RedBeanPHP.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3
         */
        interface Logger
        {
            /**
             * Um logger (para driver PDO ou OCI) precisa implementar o método
             * log. O método log receberá dados de registro. Observe que o
             * número de parâmetros é 0, isso significa que todos os parâmetros
             * são opcionais e o número pode variar. Desta forma o logger pode
             * ser utilizado de uma forma muito flexível. Às vezes, o logger é
             * usado para registrar uma mensagem de erro simples e, em outras
             * situações, sql e ligações são passados. O método log deve ser
             * capaz de aceitar todos os tipos de parâmetros e dados usando
             * funções como func_num_args/func_get_args.
             *
             * @param string $message, ...
             * @return void
             */
            public function log();
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\Logger
    {
        use RedBeanPHP\Logger as Logger;
        use RedBeanPHP\RedException as RedException;

        /**
         * Registrador. Fornece uma função básica de registro para
         * RedBeanPHP.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class RDefault implements Logger
        {
            /**
             * Modos de registro.
             */
            const C_LOGGER_ECHO  = 0;
            const C_LOGGER_ARRAY = 1;

            /**
             * @var integer
             */
            protected $mode = 0;

            /**
             * @var array
             */
            protected $logs = array();

            /**
             * Registro do método de criador de logs padrão para STDOUT.
             * Esta é a implementação padrão/de referência de um criador
             * de logs. Este método irá gravar o valor da mensagem em
             * STDOUT (tela), a menos que você tenha alterado o modo de
             * operação para C_LOGGER_ARRAY.
             *
             * @param $message (opcional) mensagem para registrar (também
             *                            pode ser dados ou saída).
             *
             * @return void
             */
            public function log()
            {
                if (func_num_args() < 1)
                {
                    return;
                }

                foreach (func_get_args() as $argument)
                {
                    if (is_array($argument))
                    {
                        $log = var_export($argument, true);

                        if ($this->mode === self::C_LOGGER_ECHO)
                        {
                            echo $log;
                        } else
                        {
                            $this->logs[] = $log;
                        }
                    } else
                    {
                        if ($this->mode === self::C_LOGGER_ECHO)
                        {
                            echo $argument;
                        } else
                        {
                            $this->logs[] = $argument;
                        }
                    }

                    if ($this->mode === self::C_LOGGER_ECHO)
                    {
                        echo "<br>" . PHP_EOL;
                    }
                }
            }

            /**
             * Retorna a matriz de log interno. A matriz de log interno
             * é onde todas as mensagens de log são armazenadas.
             *
             * @return array.
             */
            public function getLogs()
            {
                return $this->logs;
            }

            /**
             * Limpa a matriz de log interno, removendo todas as
             * entradas armazenadas anteriormente.
             *
             * @return self.
             */
            public function clear()
            {
                $this->logs = array();

                return $this;
            }

            /**
             * Seleciona um modo de registro.
             * Tem várias opções acessíveis.
             *
             * * C_LOGGER_ARRAY - log silenciosamente, armazena entradas apenas
             *                    na matriz de log interno.
             *
             * * C_LOGGER_ECHO - também encaminha mensagens de log diretamente
             *                   para STDOUT.
             *
             * @param integer $mode modo de operação para registrar objeto.
             * @return self
             */
            public function setMode($mode)
            {
                if ($mode !== self::C_LOGGER_ARRAY && $mode !== self::C_LOGGER_ECHO)
                {
                    throw new RedException(
                        "Invalid mode selected for logger, use C_LOGGER_ARRAY or C_LOGGER_ECHO."
                    );
                }

                $this->mode = $mode;
                return $this;
            }

            /**
             * Pesquisa todas as entradas de log no vetor de log interno
             * por $needle e retorna essas entradas. Este método retornará
             * um array contendo todas as correspondências para sua consulta
             * de pesquisa.
             *
             * @param string $needle frase a ser procurada no vetor de log
             *                       interno.
             *
             * @return array
             */
            public function grep($needle)
            {
                $found = array();

                foreach($this->logs as $logEntry)
                {
                    if (strpos($logEntry, $needle) !== false)
                    {
                        $found[] = $logEntry;
                    }
                }

                return $found;
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\Logger\RDefault
    {
        use RedBeanPHP\Logger as Logger;
        use RedBeanPHP\Logger\RDefault as RDefault;
        use RedBeanPHP\RedException as RedException;

        /**
         * Debug logger.
         * A special logger for debugging purposes.
         * Provides debugging logging functions for RedBeanPHP.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Debug extends RDefault implements Logger
        {
            /**
             * @var integer.
             */
            protected $strLen = 40;

            /**
             * @var boolean.
             */
            protected static $noCLI = false;

            /**
             * @var boolean.
             */
            protected $flagUseStringOnlyBinding = false;

            /**
             * Alterna a substituição da CLI. Por padrão, as funções de
             * depuração terão resultados diferentes com base nos valores
             * PHP_SAPI. Esta função permite substituir a configuração
             * PHP_SAPI. Se você definir como true, a saída CLI será
             * suprimida em favor da saída HTML. Portanto, para obter
             * HTML na linha de comando, use.
             * setOverrideCLIOutput(true).
             *
             * @param boolean $yesNo CLI-override setting flag.
             * @return void.
             */
            public static function setOverrideCLIOutput($yesNo)
            {
                self::$noCLI = $yesNo;
            }

            /**
             * Grava uma consulta para registro com todas as
             * ligações/parâmetros preenchidos.
             *
             * @param string $newSql      A pergunta.
             * @param array  $newBindings As ligações para processar (pares chave-valor).
             * @return string
             */
            protected function writeQuery( $newSql, $newBindings )
            {
                /**
                 * Evite colisões de str_replace: slot1 e slot10 (problema 407).
                 */
                uksort( $newBindings, function($a, $b)
                {
                    return (strlen($b) - strlen($a));
                });

                $newStr = $newSql;
                foreach($newBindings as $slot => $value)
                {
                    if (strpos($slot, ":") === 0)
                    {
                        $newStr = str_replace(
                            $slot,
                            $this->fillInValue($value),
                            $newStr
                        );
                    }
                }

                return $newStr;
            }

            /**
             * Preenche um valor de uma ligação e trunca a sequência
             * resultante, se necessário.
             *
             * @param mixed $value bound value.
             * @return string.
             */
            protected function fillInValue($value)
            {
                if (is_array($value) && count($value) == 2)
                {
                    $paramType = end($value);
                    $value = reset($value);
                } else
                {
                    $paramType = NULL;
                }

                if (is_null($value))
                {
                    $value = "NULL";
                }

                if ($this->flagUseStringOnlyBinding)
                {
                    $paramType = \PDO::PARAM_STR;
                }

                if ($paramType != \PDO::PARAM_INT && $paramType != \PDO::PARAM_STR)
                {
                    if (\RedBeanPHP\QueryWriter\AQueryWriter::canBeTreatedAsInt($value) || $value === "NULL")
                    {
                        $paramType = \PDO::PARAM_INT;
                    } else
                    {
                        $paramType = \PDO::PARAM_STR;
                    }
                }

                if (strlen($value) > ($this->strLen))
                {
                    $value = substr($value, 0, ($this->strLen)) . "... ";
                }

                if ($paramType === \PDO::PARAM_STR)
                {
                    $value = "'" . $value . "'";
                }

                return $value;
            }

            /**
             * Dependendo do modo de operação atual, este método registrará
             * e enviará para STDIN ou apenas registrará. Dependendo do valor
             * da constante PHP_SAPI esta função formatará a saída para console
             * ou HTML.
             *
             * @param string $str string para registrar ou gerar e registrar.
             * @return void
             */
            protected function output($str)
            {
                $this->logs[] = $str;

                if (!$this->mode)
                {
                    $highlight = false;

                    /**
                     * Apenas uma heurística rápida para destacar alterações
                     * no esquema.
                     */
                    if (strpos($str, "CREATE") === 0 ||
                        strpos($str, "ALTER") === 0 ||
                        strpos($str, "DROP") === 0)
                    {
                        $highlight = true;
                    }

                    if (PHP_SAPI === "cli" && !self::$noCLI)
                    {
                        if ($highlight)
                        {
                            echo "\e[91m";
                        }

                        echo $str, PHP_EOL;
                        echo "\e[39m";
                    } else
                    {
                        if ($highlight)
                        {
                            echo "<b style=\"color:red\">{$str}</b>";
                        } else
                        {
                            echo $str;
                        }

                        echo "<br>";
                    }
                }
            }

            /**
             * Normaliza os slots em uma string SQL.
             * Substitui os slots de ponto de interrogação por :slot1 :slot2 etc.
             *
             * @param string $sql sql para normalizar.
             * @return string.
             */
            protected function normalizeSlots($sql)
            {
                $newSql = $sql;
                $i = 0;

                while (strpos($newSql, "?") !== false)
                {
                    $pos = strpos($newSql, "?");
                    $slot = ":slot".$i;
                    $begin = substr($newSql, 0, $pos);
                    $end = substr($newSql, $pos + 1);

                    if (PHP_SAPI === "cli" && !self::$noCLI)
                    {
                        $newSql = "{$begin}\e[32m{$slot}\e[39m{$end}";
                    } else
                    {
                        $newSql = "{$begin}<b style=\"color:green\">$slot</b>{$end}";
                    }

                    $i ++;
                }

                return $newSql;
            }

            /**
             * Normaliza as ligações.
             * Substitui chaves de ligação numérica por :slot1 :slot2 etc.
             *
             * @param array $bindings bindings to normalize.
             * @return array.
             */
            protected function normalizeBindings($bindings)
            {
                $i = 0;
                $newBindings = array();

                foreach($bindings as $key => $value)
                {
                    if (is_numeric($key))
                    {
                        $newKey = ":slot".$i;
                        $newBindings[$newKey] = $value;
                        $i++;
                    } else
                    {
                        $newBindings[$key] = $value;
                    }
                }

                return $newBindings;
            }

            /**
             * Método registrador.
             * São necessários vários argumentos para tentar criar
             * um log de depuração adequado com base nos dados
             * disponíveis.
             *
             * @return void
             */
            public function log()
            {
                if (func_num_args() < 1)
                {
                    return;
                }

                $sql = func_get_arg( 0 );

                if ( func_num_args() < 2)
                {
                    $bindings = array();
                } else
                {
                    $bindings = func_get_arg( 1 );
                }

                if (!is_array($bindings))
                {
                    return $this->output($sql);
                }

                $newSql = $this->normalizeSlots($sql);
                $newBindings = $this->normalizeBindings($bindings);
                $newStr = $this->writeQuery($newSql, $newBindings);
                $this->output($newStr);
            }

            /**
             * Define o comprimento máximo da string para a saída
             * do parâmetro em consultas SQL. Defina esse valor
             * como um número razoável para manter suas consultas
             * SQL legíveis.
             *
             * @param integer $len string length.
             * @return self.
             */
            public function setParamStringLength($len = 20)
            {
                $this->strLen = max(0, $len);

                return $this;
            }

            /**
             * Se todos os parâmetros devem ser vinculados como strings.
             * Se definido como true, isso fará com que todos os números
             * inteiros sejam vinculados como STRINGS. Isso NÃO afetará
             * os valores NULL.
             *
             * @param boolean $yesNo pass true para vincular todos os
             *                                 parâmetros como strings.
             * @return self
             */
            public function setUseStringOnlyBinding($yesNo = false)
            {
                $this->flagUseStringOnlyBinding = (boolean) $yesNo;

                return $this;
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        /**
         * Interface para drivers de banco de dados. A API do driver
         * está em conformidade com o pseudo padrão ADODB para drivers
         * de banco de dados.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        interface Driver
        {
            /**
             * Executa uma consulta e busca resultados como uma matriz
             * multidimensional.
             *
             * @param string $sql      Consulta SQL a ser executada.
             * @param array  $bindings lista de valores para vincular ao snippet SQL.
             *
             * @return array
             */
            public function GetAll($sql, $bindings = array());

            /**
             * Executa uma consulta e busca resultados como uma coluna.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Lista de valores para vincular ao snippet SQL.
             *
             * @return array
             */
            public function GetCol( $sql, $bindings = array() );

            /**
             * Executa uma consulta e retorna resultados como uma única célula.
             *
             * @param string $sql      Consulta SQL a ser executada.
             * @param array  $bindings Lista de valores para vincular ao snippet SQL.
             *
             * @return mixed
             */
            public function GetOne($sql, $bindings = array());

            /**
             * Executa uma consulta e retorna resultados como uma
             * matriz associativa indexada pela primeira coluna.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Lista de valores para vincular ao snippet SQL.
             *
             * @return array.
             */
            public function GetAssocRow($sql, $bindings = array());

            /**
             * Executa uma consulta e retorna uma matriz simples contendo
             * os valores de uma linha.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Lista de valores para vincular ao snippet SQL.
             *
             * @return array
             */
            public function GetRow($sql, $bindings = array());

            /**
             * Executa código SQL e permite vinculação de valores-chave.
             * Esta função permite fornecer um array com valores para
             * vincular aos parâmetros de consulta. Por exemplo, você
             * pode vincular valores a pontos de interrogação na
             * consulta. Cada valor na matriz corresponde ao ponto de
             * interrogação na consulta que corresponde à posição do
             * valor na matriz. Você também pode vincular valores usando
             * chaves explícitas, por exemplo array(":key"=>123) vinculará
             * o número inteiro 123 à chave :key no SQL. Este método
             * não tem valor de retorno.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Lista de valores para vincular ao snippet SQL.
             *
             * @return int Linhas afetadas.
             */
            public function Execute($sql, $bindings = array());

            /**
             * Retorna o ID de inserção mais recente se o driver suportar
             * esse recurso.
             *
             * @return integer.
             */
            public function GetInsertID();

            /**
             * Retorna o número de linhas afetadas pela consulta mais
             * recente se o driver atualmente selecionado oferecer
             * suporte a esse recurso.
             *
             * @return integer.
             */
            public function Affected_Rows();

            /**
             * Retorna um objeto semelhante a um cursor do banco de dados.
             *
             * @param string $sql      Consulta SQL a ser executada.
             * @param array  $bindings Lista de valores para vincular ao snippet SQL.
             *
             * @return Cursor.
             */
            public function GetCursor($sql, $bindings = array());

            /**
             * Alterna o modo de depuração. No modo debug o driver
             * irá imprimir todo o SQL na tela junto com algumas
             * informações sobre os resultados.
             *
             * Este método é para um controle mais refinado. Normalmente
             * você deve usar a fachada para iniciar o depurador de
             * consulta para você. A fachada gerenciará as fiações de
             * objetos necessárias para usar a funcionalidade de
             * depuração.
             *
             * Uso (através da fachada):
             *     <code>
             *         R::debug(true);
             *             ... resto do programa ...
             *         R::debug(false);
             *     </code>
             *
             * O exemplo acima ilustra como usar o depurador de
             * consultas RedBeanPHP através da fachada.
             *
             * @param boolean $trueFalse alterna on/off.
             * @param Logger  $logger    logger instance.
             *
             * @return void.
             */
            public function setDebugMode($tf, $customLogger);

            /**
             * Confirma uma transação.
             *
             * @return void.
             */
            public function CommitTrans();

            /**
             * Inicia uma transação.
             *
             * @return void.
             */
            public function StartTrans();

            /**
             * Reverte uma transação.
             *
             * @return void.
             */
            public function FailTrans();

            /**
             * Redefine o contador de consultas interno.
             *
             * @return self.
             */
            public function resetCounter();

            /**
             * Retorna o número de consultas SQL processadas.
             *
             * @return integer
             */
            public function getQueryCount();

            /**
             * Define o código de inicialização para conexão.
             *
             * @param callable|NULL $code code.
             *
             * @return void.
             */
            public function setInitCode($code);

            /**
             * Retorna a string da versão do servidor de banco de dados.
             *
             * @return string.
             */
            public function DatabaseServerVersion();
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\Driver
    {
        use RedBeanPHP\Driver as Driver;
        use RedBeanPHP\Logger as Logger;
        use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;
        use RedBeanPHP\RedException as RedException;
        use RedBeanPHP\RedException\SQL as SQL;
        use RedBeanPHP\Logger\RDefault as RDefault;
        use RedBeanPHP\PDOCompatible as PDOCompatible;
        use RedBeanPHP\Cursor\PDOCursor as PDOCursor;


        /**
         * PDO Driver.
         * Este driver implementa a API do driver RedBean. para
         * RedBeanPHP. Este é o driver de banco de dados
         * especificação/padrão para RedBeanPHP.
         * 
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class RPDO implements Driver
        {
            /**
             * @var integer.
             */
            protected $max;

            /**
             * @var string.
             */
            protected $dsn;

            /**
             * @var boolean.
             */
            protected $loggingEnabled = false;

            /**
             * @var Logger|NULL.
             */
            protected $logger = NULL;

            /**
             * @var \PDO|NULL.
             */
            protected $pdo;

            /**
             * @var integer.
             */
            protected $affectedRows;

            /**
             * @var array.
             */
            protected $resultArray;

            /**
             * @var array.
             */
            protected $connectInfo = array();

            /**
             * @var boolean.
             */
            protected $isConnected = false;

            /**
             * @var bool.
             */
            protected $flagUseStringOnlyBinding = false;

            /**
             * @var integer.
             */
            protected $queryCounter = 0;

            /**
             * @var string.
             */
            protected $mysqlCharset = "";

            /**
             * @var string.
             */
            protected $mysqlCollate = "";

            /**
             * @var boolean.
             */
            protected $stringifyFetches = true;

            /**
             * @var string|NULL.
             */
            protected $initSQL = NULL;

            /**
             * @var callable|NULL.
             */
            protected $initCode = NULL;

            /**
             * Vincula parâmetros. Este método vincula parâmetros a um
             * PDOStatement para execução de consulta. Este método vincula
             * parâmetros como NULL, INTEGER ou STRING e oferece suporte
             * a chaves nomeadas e chaves de ponto de interrogação.
             *
             * @param \PDOStatement $statement PDO Statement instance.
             * @param array         $bindings  valores que precisam ser
             *                                 vinculados à instrução.
             *
             * @return void
             */
            protected function bindParams($statement, $bindings)
            {
                foreach ($bindings as $key => &$value)
                {
                    $k = is_integer($key) ? $key + 1 : $key;

                    if (is_array($value) && count($value) == 2)
                    {
                        $paramType = end($value);
                        $value = reset($value);
                    } else
                    {
                        $paramType = NULL;
                    }

                    if (is_null($value))
                    {
                        $statement->bindValue($k, NULL, \PDO::PARAM_NULL);
                        continue;
                    }

                    if ($paramType != \PDO::PARAM_INT && $paramType != \PDO::PARAM_STR)
                    {
                        if (!$this->flagUseStringOnlyBinding && AQueryWriter::canBeTreatedAsInt($value) && abs($value) <= $this->max)
                        {
                            $paramType = \PDO::PARAM_INT;
                        } else
                        {
                            $paramType = \PDO::PARAM_STR;
                        }
                    }

                    $statement->bindParam($k, $value, $paramType);
                }
            }

            /**
             * Este método executa a consulta SQL real e vincula uma lista
             * de parâmetros à consulta. slots. O resultado da consulta será
             * armazenado na propriedade protegida $rs (sempre array). O
             * número de linhas afetadas (resultado do rowcount, se suportado
             * pelo banco de dados) é armazenado na propriedade protegida
             * $affectedRows. Se o sinalizador de depuração estiver definido,
             * esta função enviará a saída de depuração para o buffer de tela.
             *
             * @param string $sql      A string SQL a ser enviada ao servidor de banco de dados.
             * @param array  $bindings Os valores que precisam ser vinculados aos slots de consulta.
             * @param array  $options
             *
             * @return mixed
             * @throws SQL
             */
            public function runQuery( $sql, $bindings, $options = array() )
            {
                $this->connect();

                if ($this->loggingEnabled && $this->logger)
                {
                    $this->logger->log($sql, $bindings);
                }

                try
                {
                    if (strpos("pgsql", $this->dsn) === 0)
                    {
                        if (defined("\\PDO::PGSQL_ATTR_DISABLE_NATIVE_PREPARED_STATEMENT"))
                        {
                            $statement = @$this->pdo->prepare(
                                $sql,

                                array(
                                    \PDO::PGSQL_ATTR_DISABLE_NATIVE_PREPARED_STATEMENT => true
                                )
                            );
                        } else
                        {
                            $statement = $this->pdo->prepare($sql);
                        }
                    } else
                    {
                        $statement = $this->pdo->prepare($sql);
                    }

                    $this->bindParams($statement, $bindings);
                    $statement->execute();
                    $this->queryCounter ++;
                    $this->affectedRows = $statement->rowCount();

                    if (isset($options["noFetch"]) && $options["noFetch"])
                    {
                        $this->resultArray = array();

                        return $statement;
                    }

                    if ($statement->columnCount())
                    {
                        $fetchStyle = (
                            isset(
                                $options["fetchStyle"]
                            )
                        ) ? $options["fetchStyle"] : NULL;

                        if (is_null($fetchStyle))
                        {
                            $this->resultArray = $statement->fetchAll();
                        } else
                        {
                            $this->resultArray = $statement->fetchAll( $fetchStyle );
                        }

                        if ($this->loggingEnabled && $this->logger)
                        {
                            $this->logger->log(
                                "resultset: " . count($this->resultArray) . " rows"
                            );
                        }
                    } else
                    {
                        $this->resultArray = array();
                    }
                } catch (\PDOException $e)
                {
                    /**
                     * Infelizmente, o campo de código deveria ser int por
                     * padrão (php). Portanto, precisamos de uma propriedade
                     * para transmitir o código do estado SQL.
                     */
                    $err = $e->getMessage();

                    /**
                     *
                     */
                    if ($this->loggingEnabled && $this->logger)
                    {
                        $this->logger->log("An error occurred: " . $err);
                    }

                    $exception = new SQL($err, 0, $e);
                    $exception->setSQLState($e->getCode());
                    $exception->setDriverDetails($e->errorInfo);
                    throw $exception;
                }
            }

            /**
             * Tente corrigir problemas de codificação de caracteres
             * do MySQL. MySQL < 5.5.3 não suporta Unicode adequado
             * de 4 bytes, mas parece que eles o adicionaram na
             * versão 5.5.3 com um rótulo diferente: utf8mb4.
             * Tentamos selecionar o melhor conjunto de caracteres
             * possível com base nos dados da sua versão.
             *
             * @return void.
             */
            protected function setEncoding()
            {
                $driver = $this->pdo->getAttribute(
                    \PDO::ATTR_DRIVER_NAME
                );

                if ($driver === "mysql")
                {
                    $charset = $this->hasCap("utf8mb4") ? "utf8mb4" : "utf8";
                    $collate = $this->hasCap("utf8mb4_520") ? "_unicode_520_ci" : "_unicode_ci";

                    /**
                     * Em cada reconexão.
                     */
                    $this->pdo->setAttribute(
                        \PDO::MYSQL_ATTR_INIT_COMMAND, "SET NAMES ". $charset
                    );

                    /**
                     * #624 removeu espaço antes de SET NAMES porque causa
                     * problemas com o ProxySQL. também para conexão
                     * atual.
                     */
                    $this->pdo->exec("SET NAMES ". $charset);

                    /**
                     *
                     */
                    $this->mysqlCharset = $charset;
                    $this->mysqlCollate = $charset . $collate;
                }
            }

            /**
             * Determine se um banco de dados oferece suporte a um
             * recurso específico. Atualmente esta função pode ser
             * usada para detectar os seguintes recursos:
             *     - utf8mb4
             *     - utf8mb4 520
             *
             * Uso:
             *     <code>
             *         $this->hasCap("utf8mb4_520");
             *     </code>
             *
             * Por padrão, RedBeanPHP usa esse método nos bastidores
             * para garantir que você use a codificação UTF8 mais
             * recente possível para seu banco de dados.
             *
             * @param string $db_cap identificador da capacidade do
             *                       banco de dados.
             *
             * @return int|false Se o recurso de banco de dados é suportado;
             *                   caso contrário, FALSO.
             */
            protected function hasCap($db_cap)
            {
                $compare = false;
                $version = $this->pdo->getAttribute(\PDO::ATTR_SERVER_VERSION);

                switch (strtolower($db_cap))
                {
                    case "utf8mb4":
                        /**
                         * oneliner, para aumentar a cobertura do
                         * código (a cobertura não abrange versões).
                         */
                        if (version_compare($version, "5.5.3", "<"))
                        {
                            return false;
                        }

                        /**
                         *
                         */
                        $client_version = $this->pdo->getAttribute(
                            \PDO::ATTR_CLIENT_VERSION
                        );

                        /**
                         * libmysql suporta utf8mb4 desde 5.5.3, assim como o
                         * servidor MySQL. mysqlnd suporta utf8mb4 desde
                         * 5.0.9.
                         */
                        if (strpos($client_version, "mysqlnd") !== false)
                        {
                            $client_version = preg_replace('/^\D+([\d.]+).*/', "$1", $client_version);
                            $compare = version_compare($client_version, "5.0.9", ">=");
                        } else
                        {
                            $compare = version_compare($client_version, "5.5.3", ">=");
                        }

                        break;

                    case "utf8mb4_520":
                        $compare = version_compare($version, "5.6", ">=");
                        break;
                }

                return $compare;
            }

            /**
             * Construtor. Você pode especificar dsn, usuário e senha
             * ou apenas fornecer uma conexão PDO existente.
             *
             * Uso:
             *     <code>
             *         $driver = new RPDO($dsn, $user, $password);
             *     </code>
             *
             * O exemplo acima ilustra como criar uma instância de
             * driver a partir de uma string de conexão de banco de
             * dados (dsn), um nome de usuário e uma senha. Também
             * é possível passar um objeto PDO.
             *
             * Uso:
             *     <code>
             *         $driver = new RPDO($existingConnection);
             *     </code>
             *
             * O segundo exemplo mostra como criar uma instância RPDO
             * a partir de um objeto PDO existente.
             *
             * @param string|\PDO   $dsn  Cadeia de conexão do banco de dados.
             * @param string        $user Opcional, nome de usuário para fazer login.
             * @param string        $pass Opcional, senha para login de conexão.
             *
             * @return void
             */
            public function __construct($dsn, $user = NULL, $pass = NULL, $options = array())
            {
                if (is_object($dsn))
                {
                    $this->pdo = $dsn;
                    $this->isConnected = true;
                    $this->setEncoding();

                    $this->pdo->setAttribute(
                        \PDO::ATTR_ERRMODE,
                        \PDO::ERRMODE_EXCEPTION
                    );

                    $this->pdo->setAttribute(
                        \PDO::ATTR_DEFAULT_FETCH_MODE,
                        \PDO::FETCH_ASSOC
                    );

                    /**
                     * Certifique-se de que o dsn contenha pelo menos
                     * o tipo.
                     */
                    $this->dsn = $this->getDatabaseType();
                } else
                {
                    $this->dsn = $dsn;
                    $this->connectInfo = array(
                        "pass" => $pass,
                        "user" => $user
                    );

                    if (is_array($options))
                    {
                        $this->connectInfo["options"] = $options;
                    }
                }

                /**
                 * PHP 5.3 PDO SQLite possui um bug com números
                 * grandes:
                 */
                if ((strpos( $this->dsn, "sqlite") === 0 && PHP_MAJOR_VERSION === 5 && PHP_MINOR_VERSION === 3) ||  defined("HHVM_VERSION") || $this->dsn === "test-sqlite-53")
                {
                    /**
                     * Caso contrário, você obterá -2147483648 ?!
                     * demonstrado na versão #603 do Travis.
                     */
                    $this->max = 2147483647;
                } elseif (strpos( $this->dsn, "cubrid") === 0)
                {
                    /**
                     * bindParam em pdo_cubrid também falha...
                     */
                    $this->max = 2147483647;
                } else
                {
                    /**
                     * O valor normal, é claro (torna possível usar números
                     * grandes na cláusula LIMIT).
                     */
                    $this->max = PHP_INT_MAX;
                }
            }

            /**
             * Define o PDO no modo de busca stringify. Se definido
             * como true, este método garantirá que todos os dados
             * recuperados do banco de dados sejam buscados como uma
             * string. Padrão: true. Para defini-lo como false...
             *
             * Uso:
             *     <code>
             *         R::getDatabaseAdapter()
             *             ->getDatabase()
             *             ->stringifyFetches(false);
             *     </code>
             *
             * Importante !
             * Observação, este método só funciona se você definir o
             * valor ANTES de a conexão ser estabelecida. Além disso,
             * esta configuração funciona SOMENTE com ALGUNS drivers.
             * Cabe ao motorista honrar essa configuração.
             *
             * @param boolean $bool
             */
            public function stringifyFetches($bool)
            {
                $this->stringifyFetches = $bool;
            }

            /**
             * Retorna a melhor codificação possível para MySQL com base
             * nos dados da versão. Este método pode ser usado para obter
             * os melhores parâmetros de conjunto de caracteres possíveis
             * para seu banco de dados ao construir uma consulta de criação
             * de tabela contendo cláusulas como: CHARSET=... COLLATE=...
             * Este é um método específico do MySQL e não faz parte da
             * interface do driver.
             *
             * Uso:
             *     <code>
             *         $charset_collate = $this
             *             ->adapter
             *             ->getDatabase()
             *             ->getMysqlEncoding(true);
             *     </code>
             *
             * @param boolean $retCol passe true para retornar charset/collate.
             * @return string|array.
             */
            public function getMysqlEncoding($retCol = false)
            {
                if ($retCol)
                {
                    return array(
                        "charset" => $this->mysqlCharset,
                        "collate" => $this->mysqlCollate
                    );
                }

                return $this->mysqlCharset;
            }

            /**
             * Se todos os parâmetros devem ser vinculados como
             * strings. Se definido como true, isso fará com que
             * todos os números inteiros sejam vinculados como
             * STRINGS. Isso NÃO afetará os valores NULL.
             *
             * @param boolean $yesNo passe true para vincular todos
             *                       os parâmetros como strings.
             *
             * @return void
             */
            public function setUseStringOnlyBinding($yesNo)
            {
                $this->flagUseStringOnlyBinding = (boolean) $yesNo;

                if ($this->loggingEnabled && $this->logger && method_exists($this->logger, "setUseStringOnlyBinding"))
                {
                    $this->logger->setUseStringOnlyBinding(
                        $this->flagUseStringOnlyBinding
                    );
                }
            }

            /**
             * Define o valor máximo a ser vinculado como inteiro,
             * normalmente esse valor é igual à constante MAX INT
             * do PHP, porém às vezes as ligações do driver PDO
             * não podem vincular números inteiros grandes como
             * inteiros. Este método permite que você defina
             * manualmente o valor máximo de ligação inteira para
             * gerenciar problemas de portabilidade/compatibilidade
             * entre diferentes compilações PHP. Este método
             * retornará o valor antigo.
             *
             * @param integer $max valor máximo para ligações inteiras.
             *
             * @return integer.
             */
            public function setMaxIntBind($max)
            {
                if (!is_integer($max))
                {
                    throw new RedException(
                        "Parameter has to be integer."
                    );
                }

                $oldMax = $this->max;
                $this->max = $max;

                return $oldMax;
            }

            /**
             * Define o código de inicialização para ser executado
             * na conexão.
             *
             * @param callable|NULL $code.
             *
             * @return void.
             */
            public function setInitCode($code)
            {
                $this->initCode = $code;
            }

            /**
             * Estabelece uma conexão com o banco de dados usando
             * a funcionalidade PHP\PDO. Se uma conexão já tiver
             * sido estabelecida, este método simplesmente
             * retornará diretamente. Este método também ativa
             * UTF8 para o banco de dados e PDO-ERRMODE-EXCEPTION,
             * bem como PDO-FETCH-ASSOC.
             *
             * @return void.
             */
            public function connect()
            {
                if ($this->isConnected)
                {
                    return;
                }

                try
                {
                    $user = $this->connectInfo["user"];
                    $pass = $this->connectInfo["pass"];
                    $options = array();

                    if (isset($this->connectInfo["options"]) && is_array($this->connectInfo["options"]))
                    {
                        $options = $this->connectInfo["options"];
                    }

                    $this->pdo = new \PDO( $this->dsn, $user, $pass, $options );
                    $this->setEncoding();
                    $this->pdo->setAttribute( \PDO::ATTR_STRINGIFY_FETCHES, $this->stringifyFetches );

                    /**
                     * Não consigo passar isso como argumento para o
                     * construtor, o driver CUBRID não entende ...
                     */
                    $this->pdo->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
                    $this->pdo->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC);
                    $this->isConnected = true;

                    /**
                     * Execute a consulta de inicialização, se houver.
                     */
                    if ($this->initSQL !== NULL)
                    {
                        $this->Execute($this->initSQL);
                        $this->initSQL = NULL;
                    }

                    if ($this->initCode !== NULL)
                    {
                        $code = $this->initCode;
                        $code(
                            $this->pdo->getAttribute(
                                \PDO::ATTR_SERVER_VERSION
                            )
                        );
                    }
                } catch (\PDOException $exception)
                {
                    $matches = array();
                    $dbname = (preg_match('/dbname=(\w+)/', $this->dsn, $matches)) ? $matches[1] : "?";

                    throw new \PDOException(
                        "Could not connect to database (" . $dbname . ").", $exception->getCode()
                    );
                }
            }

            /**
             * Define diretamente a instância do PDO no driver. Este
             * método pode melhorar o desempenho, porém como o driver
             * não configura esta instância coisas terríveis podem
             * acontecer... só use este método se você for um
             * especialista em conexões RedBeanPHP, PDO e UTF8 e
             * conhecer MUITO BEM seu servidor de banco de dados.
             *
             * - connected     true|false (trate esta instância como conectada, padrão: true).
             * - setEncoding   true|false (deixe o RedBeanPHP definir a codificação para você, padrão: true).
             * - setAttributes true|false (deixe o RedBeanPHP definir atributos para você, padrão: true)*
             * - setDSNString  true|false (extrair string DSN da instância PDO, padrão: true).
             * - stringFetch   true|false (se você deseja restringir as buscas ou não, padrão: true).
             * - runInitCode   true|false (execute o código de inicialização, se houver, padrão: true)
             * 
             * *atributos:
             *     - RedBeanPHP solicitará ao driver do banco de dados que
             *                  lance exceções em caso de erros (recomendado
             *                  para compatibilidade).
             *
             *     - RedBeanPHP solicitará ao driver do banco de dados que
             *                  use matrizes associativas ao buscar (recomendado
             *                  para compatibilidade).
             *
             * @param \PDO  $pdo     Instância PDO.
             * @param array $options Opções para aplicar.
             *
             * @return void.
             */
            public function setPDO(\PDO $pdo, $options = array())
            {
                $this->pdo = $pdo;
                $connected = true;
                $setEncoding = true;
                $setAttributes = true;
                $setDSNString = true;
                $runInitCode = true;
                $stringFetch = true;

                if (isset($options["connected"]))
                {
                    $connected = $options["connected"];
                }

                if (isset($options["setEncoding"]))
                {
                    $setEncoding = $options["setEncoding"];
                }

                if (isset($options["setAttributes"]))
                {
                    $setAttributes = $options["setAttributes"];
                }

                if (isset($options["setDSNString"]))
                {
                    $setDSNString = $options["setDSNString"];
                }

                if (isset($options["runInitCode"]))
                {
                    $runInitCode = $options["runInitCode"];
                }

                if (isset($options["stringFetch"]))
                {
                    $stringFetch = $options["stringFetch"];
                }

                if ($connected)
                {
                    $this->isConnected = $connected;
                }

                if ($setEncoding)
                {
                    $this->setEncoding();
                }

                if ($setAttributes)
                {
                    $this->pdo->setAttribute(\PDO::ATTR_ERRMODE,\PDO::ERRMODE_EXCEPTION);
                    $this->pdo->setAttribute(\PDO::ATTR_DEFAULT_FETCH_MODE,\PDO::FETCH_ASSOC);
                    $this->pdo->setAttribute(\PDO::ATTR_STRINGIFY_FETCHES, $stringFetch);
                }

                if ($runInitCode)
                {
                    /**
                     * Execute a consulta de inicialização, se houver.
                     */
                    if ($this->initSQL !== NULL)
                    {
                        $this->Execute($this->initSQL);
                        $this->initSQL = NULL;
                    }

                    if ($this->initCode !== NULL)
                    {
                        $code = $this->initCode;
                        $code(
                            $this->pdo->getAttribute(
                                \PDO::ATTR_SERVER_VERSION
                            )
                        );
                    }
                }

                if ($setDSNString)
                {
                    $this->dsn = $this->getDatabaseType();
                }
            }

            /**
             * @see Driver::GetAll.
             */
            public function GetAll($sql, $bindings = array())
            {
                $this->runQuery($sql, $bindings);

                return $this->resultArray;
            }

            /**
             * @see Driver::GetAssocRow.
             */
            public function GetAssocRow($sql, $bindings = array())
            {
                $this->runQuery($sql, $bindings, array(
                        "fetchStyle" => \PDO::FETCH_ASSOC
                    )
                );

                return $this->resultArray;
            }

            /**
             * @see Driver::GetCol.
             */
            public function GetCol($sql, $bindings = array())
            {
                $rows = $this->GetAll($sql, $bindings);

                if (empty($rows) || !is_array($rows))
                {
                    return array();
                }

                $cols = array();
                foreach ($rows as $row)
                {
                    $cols[] = reset($row);
                }

                return $cols;
            }

            /**
             * @see Driver::GetOne.
             */
            public function GetOne($sql, $bindings = array())
            {
                $arr = $this->GetAll($sql, $bindings);

                if (empty($arr[0]) || !is_array($arr[0]))
                {
                    return NULL;
                }

                return reset($arr[0]);
            }

            /**
             * Alias para getOne().
             * Compatibilidade com versões anteriores.
             *
             * @param string $sql SQL.
             * @param array  $bindings bindings.
             *
             * @return string|NULL.
             */
            public function GetCell($sql, $bindings = array())
            {
                return $this->GetOne($sql, $bindings);
            }

            /**
             * @see Driver::GetRow.
             */
            public function GetRow($sql, $bindings = array())
            {
                $arr = $this->GetAll($sql, $bindings);

                if (is_array($arr) && count($arr))
                {
                    return reset($arr);
                }

                return array();
            }

            /**
             * @see Driver::Execute.
             */
            public function Execute($sql, $bindings = array())
            {
                $this->runQuery($sql, $bindings);

                return $this->affectedRows;
            }

            /**
             * @see Driver::GetInsertID.
             */
            public function GetInsertID()
            {
                $this->connect();

                return (int) $this->pdo->lastInsertId();
            }

            /**
             * @see Driver::GetCursor.
             */
            public function GetCursor($sql, $bindings = array())
            {
                $statement = $this->runQuery($sql, $bindings, array("noFetch" => true));
                $cursor = new PDOCursor($statement, \PDO::FETCH_ASSOC);

                return $cursor;
            }

            /**
             * @see Driver::Affected_Rows.
             */
            public function Affected_Rows()
            {
                $this->connect();

                return (int) $this->affectedRows;
            }

            /**
             * @see Driver::setDebugMode.
             */
            public function setDebugMode($tf, $logger = NULL)
            {
                $this->connect();
                $this->loggingEnabled = (bool) $tf;

                if ($this->loggingEnabled and !$logger)
                {
                    $logger = new RDefault();
                }

                $this->setLogger($logger);
            }

            /**
             * Injeta o objeto Logger.
             * Define a instância do logger que você deseja usar.
             *
             * Este método é para um controle mais refinado. Normalmente
             * você deve usar a fachada para iniciar o depurador de
             * consulta para você. A fachada gerenciará as fiações de
             * objetos necessárias para usar a funcionalidade de
             * depuração.
             *
             * Uso (através do facade):
             *     <code>
             *         R::debug( true );
             *             ...resto do programa...
             *         R::debug( false );
             *     </code>
             *
             * O exemplo acima ilustra como usar o depurador de consultas
             * RedBeanPHP através da facade.
             *
             * @param Logger $logger a instância do logger a ser usada
             *                       para registro.
             *
             * @return self
             */
            public function setLogger(Logger $logger)
            {
                $this->logger = $logger;

                return $this;
            }

            /**
             * Obtém o objeto Logger.
             * Retorna a instância do Logger atualmente ativa.
             *
             * @return Logger.
             */
            public function getLogger()
            {
                return $this->logger;
            }

            /**
             * @see Driver::StartTrans.
             */
            public function StartTrans()
            {
                $this->connect();
                $this->pdo->beginTransaction();
            }

            /**
             * @see Driver::CommitTrans.
             */
            public function CommitTrans()
            {
                $this->connect();
                $this->pdo->commit();
            }

            /**
             * @see Driver::FailTrans.
             */
            public function FailTrans()
            {
                $this->connect();
                $this->pdo->rollback();
            }

            /**
             * Retorna o nome do driver de banco de dados para PDO.
             * Utiliza o atributo PDO DRIVER NAME para obter o nome
             * do driver PDO. Use este método para identificar o
             * driver PDO atual usado para fornecer acesso ao banco
             * de dados. Exemplo de uma string de driver de banco
             * de dados:
             *
             * <code>
             *     mysql
             * </code>
             *
             * Uso:
             *     <code>
             *         echo R::getDatabaseAdapter()
             *             ->getDatabase()
             *             ->getDatabaseType();
             *     </code>
             *
             * O exemplo acima imprime a string do driver de banco de
             * dados atual em stdout. Observe que este é um método
             * específico do driver e não faz parte da interface do
             * driver. Este método pode não estar disponível em
             * outros drivers, pois depende do PDO.
             *
             * @return string.
             */
            public function getDatabaseType()
            {
                $this->connect();

                return $this->pdo->getAttribute(
                    \PDO::ATTR_DRIVER_NAME
                );
            }

            /**
             * Retorna a string do identificador de versão do cliente
             * de banco de dados. Este método pode ser usado para
             * identificar o cliente de banco de dados atualmente
             * instalado. Observe que este método também estabelecerá
             * uma conexão (porque isso é necessário para obter as
             * informações da versão).
             *
             * Exemplo de uma string de versão:
             *
             * <code>
             *     mysqlnd 5.0.12-dev - 20150407 - $Id: b5c5906d452ec590732a93b051f3827e02749b83 $
             * </code>
             *
             * Uso:
             *     <code>
             *         echo R::getDatabaseAdapter()
             *             ->getDatabase()
             *             ->getDatabaseVersion();
             *     </code>
             *
             * O exemplo acima imprimirá a string da versão em stdout.
             *
             * Observe que este é um método específico do driver e não
             * faz parte da interface do driver. Este método pode não
             * estar disponível em outros drivers, pois depende do PDO.
             *
             * Para obter a versão do servidor de banco de dados, use
             * getDatabaseServerVersion().
             *
             * @return mixed.
             */
            public function getDatabaseVersion()
            {
                $this->connect();
                return $this->pdo->getAttribute(
                    \PDO::ATTR_CLIENT_VERSION
                );
            }

            /**
             * Retorna a instância PHP PDO subjacente. Para algumas
             * operações de banco de dados de baixo nível, você precisará
             * de acesso ao objeto PDO. Não que este método esteja disponível
             * apenas em RPDO e outros drivers de banco de dados baseados em
             * PDO para RedBeanPHP. Outros drivers podem não ter um método
             * como este. O exemplo a seguir demonstra como obter uma
             * referência à instância PDO da fachada:
             *
             * Uso:
             *     <code>
             *         $pdo = R::getDatabaseAdapter()
             *             ->getDatabase()
             *             ->getPDO();
             *     </code>
             *
             * @return \PDO
             */
            public function getPDO()
            {
                $this->connect();

                return $this->pdo;
            }

            /**
             * Fecha a conexão com o banco de dados. Embora as conexões
             * com o banco de dados sejam fechadas automaticamente no
             * final do script PHP, geralmente é recomendado fechar as
             * conexões com o banco de dados para melhorar o desempenho.
             * Fechar uma conexão com o banco de dados retornará
             * imediatamente os recursos para o PHP.
             *
             * Uso:
             *     <code>
             *         R::setup( ... );
             *             ... fazer coisas ...
             *         R::close();
             *     </code>
             *
             * @return void.
             */
            public function close()
            {
                $this->pdo = NULL;
                $this->isConnected = false;
            }

            /**
             * Retorna true se a instância atual do PDO estiver
             * conectada.
             *
             * @return boolean.
             */
            public function isConnected()
            {
                return $this->isConnected && $this->pdo;
            }

            /**
             * Alterna o registro em log, ativa ou desativa o
             * registro em log.
             *
             * @param boolean $enable TRUE para ativar o registro.
             * @return self.
             */
            public function setEnableLogging($enable)
            {
                $this->loggingEnabled = (boolean) $enable;

                return $this;
            }

            /**
             * Redefine o contador de consultas. O contador de consultas
             * pode ser usado para monitorar o número de consultas ao
             * banco de dados que foram processadas de acordo com o driver
             * do banco de dados. Você pode usar isso para monitorar o
             * número de consultas necessárias para renderizar uma
             * página.
             *
             * Uso:
             *     <code>
             *              R::resetQueryCount();
             *         echo R::getQueryCount() . " queries processed.";
             *     </code>
             *
             * @return self.
             */
            public function resetCounter()
            {
                $this->queryCounter = 0;

                return $this;
            }

            /**
             * Retorna o número de consultas SQL processadas. Este
             * método retorna o número de consultas ao banco de dados
             * que foram processadas de acordo com o driver do banco
             * de dados. Você pode usar isso para monitorar o número
             * de consultas necessárias para renderizar uma página.
             *
             * Uso:
             *     <code>
             *         echo R::getQueryCount() . " queries processed.";
             *     </code>
             *
             * @return integer.
             */
            public function getQueryCount()
            {
                return $this->queryCounter;
            }

            /**
             * Retorna o valor máximo tratado como ligação de parâmetro
             * inteiro. Este método serve principalmente para fins de
             * teste, mas pode ajudá-lo a resolver alguns problemas
             * relacionados a ligações de números inteiros.
             *
             * @return integer
             */
            public function getIntegerBindingMax()
            {
                return $this->max;
            }

            /**
             * Define uma consulta a ser executada na conexão com
             * o banco de dados. Este método oferece a oportunidade
             * de configurar a conexão com um banco de dados por meio
             * de uma interface baseada em SQL. Os objetos podem
             * fornecer uma string SQL a ser executada ao estabelecer
             * uma conexão com o banco de dados. Isso foi usado para
             * resolver problemas com configurações de chave estrangeira
             * padrão no SQLite3, por exemplo, consulte problemas do
             * Git: #545 e #548.
             *
             * @param string $sql Consulta SQL a ser executada ao conectar-se
             *                    ao banco de dados.
             *
             * @return self.
             */
            public function setInitQuery($sql)
            {
                $this->initSQL = $sql;

                return $this;
            }

            /**
             * Retorna a string da versão do servidor de banco
             * de dados.
             *
             * @return string.
             */
            public function DatabaseServerVersion()
            {
                return trim(
                    strval(
                        $this->pdo->getAttribute(
                            \PDO::ATTR_SERVER_VERSION
                        )
                    )
                );
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;
        use RedBeanPHP\BeanHelper as BeanHelper;
        use RedBeanPHP\RedException as RedException;
        use RedBeanPHP\Util\Either as Either;


        /**
         * Compatibilidade com PHP 5.3. Estendemos JsonSerializable
         * para evitar conflitos de namespace, não é possível definir
         * interface com namespace especial em PHP.
         */
        if (interface_exists("\JsonSerializable"))
        {
            interface Jsonable extends \JsonSerializable {};
        } else
        {
            interface Jsonable {};
        }

        /**
         * OODBBean (Bean de banco de dados orientado a objetos).
         * Para trocar informações com o banco de dados. Um bean
         * representa uma única linha da tabela e oferece serviços
         * genéricos para interação com sistemas de bancos de dados,
         * bem como alguns metadados.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         * @desc    OODBBean representa um bean. RedBeanPHP usa beans.
         */
        class OODBBean implements \IteratorAggregate,\ArrayAccess,\Countable,Jsonable
        {
            /**
             * Modos de erro FUSE.
             */

            /**
             *
             */
            const C_ERR_IGNORE = false;
 
            /**
             *
             */
            const C_ERR_LOG = 1;

            /**
             *
             */
            const C_ERR_NOTICE = 2;

            /**
             *
             */
            const C_ERR_WARN = 3;

            /**
             *
             */
            const C_ERR_EXCEPTION = 4;

            /**
             *
             */
            const C_ERR_FUNC = 5;

            /**
             *
             */
            const C_ERR_FATAL = 6;

            /**
             * @var boolean.
             */
            protected static $useFluidCount = false;

            /**
             * @var boolean.
             */
            protected static $convertArraysToJSON = false;

            /**
             * @var boolean.
             */
            protected static $errorHandlingFUSE = false;

            /**
             * @var callable|NULL.
             */
            protected static $errorHandler = NULL;

            /**
             * @var array.
             */
            protected static $aliases = array();

            /**
             * Se estiver definido como true, a função __toString
             * codificará todas as propriedades como UTF-8 para
             * reparar codificações UTF-8 inválidas e evitar
             * exceções (que não podem ser capturadas em uma
             * função __toString).
             *
             * @var boolean.
             */
            protected static $enforceUTF8encoding = false;

            /**
             * É aqui que residem as verdadeiras propriedades do bean.
             * Eles são armazenados e recuperados pelo getter e setter
             * mágico (__get e __set).
             *
             * @var array $properties.
             */
            protected $properties = array();

            /**
             * Aqui mantemos os metadados de um bean.
             *
             * @var array
             */
            protected $__info = array();

            /**
             * O BeanHelper permite que o bean acesse os objetos
             * da caixa de ferramentas para implementar funcionalidades
             * ricas, caso contrário você teria que fazer tudo com R
             * ou objetos externos.
             *
             * @var BeanHelper|NULL.
             */
            protected $beanHelper = NULL;

            /**
             * @var string|NULL.
             */
            protected $fetchType = NULL;

            /**
             * @var string.
             */
            protected $withSql = "";

            /**
             * @var array.
             */
            protected $withParams = array();

            /**
             * @var string|NULL.
             */
            protected $aliasName = NULL;

            /**
             * @var string|NULL.
             */
            protected $via = NULL;

            /**
             * @var boolean.
             */
            protected $noLoad = false;

            /**
             * @var boolean.
             */
            protected $all = false;

            /**
             * @var string|NULL.
             */
            protected $castProperty = NULL;

            /**
             * Se o contador de fluidos estiver definido como true
             * então $bean->ownCount() retornará 0 se a tabela não
             * existir. Apenas para compatibilidade com versões
             * anteriores. Retorna o valor anterior.
             *
             * @param boolean $toggle toggle.
             * @return boolean.
             */
            public static function useFluidCount($toggle)
            {
                $old = self::$useFluidCount;
                self::$useFluidCount = $toggle;

                return $old;
            }

            /**
             * Se você definir como true, a função __toString codificará
             * todas as propriedades como UTF-8 para reparar codificações
             * UTF-8 inválidas e evitar abordagens (que não podem ser
             * capturadas em uma função __toString).
             *
             * @param boolean $toggle true para impor a codificação
             *                        UTF-8 (mais lenta).
             * @return void.
             */
            public static function setEnforceUTF8encoding($toggle)
            {
                self::$enforceUTF8encoding = (boolean) $toggle;
            }

            /**
             * Define o modo de erro para FUSE. O que fazer se não
             * existir um método de modelo FUSE ? Você pode definir
             * as seguintes opções:
             *
             * OODBBean::C_ERR_IGNORE (default), ignora a chamada e retorna NULL.
             * OODBBean::C_ERR_LOG, registra o incidente usando error_log.
             * OODBBean::C_ERR_NOTICE, desencadeia um E_USER_NOTICE.
             * OODBBean::C_ERR_WARN, desencadeia um E_USER_WARNING.
             * OODBBean::C_ERR_EXCEPTION, lança uma exceção.
             * OODBBean::C_ERR_FUNC, permite que você especifique um manipulador personalizado (função).
             * OODBBean::C_ERR_FATAL, desencadeia um E_USER_ERROR.
             *
             * <code>
             *     Custom handler method signature: handler(
             *         array(
             *             "message" => string
             *             "bean" => OODBBean
             *             "method" => string
             *         )
             *     )
             * </code>
             *
             * Este método retorna o modo antigo e o manipulador
             * como um array.
             *
             * @param integer       $mode modo de tratamento de erros.
             * @param callable|NULL $func manipulador personalizado.
             *
             * @return array
             */
            public static function setErrorHandlingFUSE($mode, $func = NULL)
            {
                if ($mode !== self::C_ERR_IGNORE &&
                    $mode !== self::C_ERR_LOG &&
                    $mode !== self::C_ERR_NOTICE &&
                    $mode !== self::C_ERR_WARN &&
                    $mode !== self::C_ERR_EXCEPTION &&
                    $mode !== self::C_ERR_FUNC &&
                    $mode !== self::C_ERR_FATAL)
                {
                    throw new \Exception(
                        "Invalid error mode selected"
                    );
                }

                if ($mode === self::C_ERR_FUNC && !is_callable($func))
                {
                    throw new \Exception(
                        "Invalid error handler"
                    );
                }

                $old = array(self::$errorHandlingFUSE, self::$errorHandler);
                self::$errorHandlingFUSE = $mode;

                if (is_callable($func))
                {
                    self::$errorHandler = $func;
                } else
                {
                    self::$errorHandler = NULL;
                }

                return $old;
            }

            /**
             * Alterna matriz para conversão JSON. Se definido como
             * true, qualquer array definido como uma propriedade
             * de bean que não seja uma lista será transformado em
             * uma string JSON. Usado junto com AQueryWriter::useJSONColumns,
             * isso estende o suporte de tipo de dados para colunas
             * JSON. Retorna o valor anterior do sinalizador.
             *
             * @param boolean $flag flag.
             * @return boolean.
             */
            public static function convertArraysToJSON($flag)
            {
                $old = self::$convertArraysToJSON;
                self::$convertArraysToJSON = $flag;

                return $old;
            }

            /**
             * Define aliases globais. Registra um lote de aliases de
             * uma só vez. Isso funciona da mesma forma que fetchAs e
             * setAutoResolve, mas explicitamente. Por exemplo, se você
             * registrar o alias "cover" para "page", uma propriedade
             * contendo uma referência a um page bean chamado "cover"
             * retornará corretamente o page bean e não um cover bean
             * (inexistente).
             *
             * <code>
             *     R::aliases(
             *         array(
             *             "cover" => "page"
             *         )
             *     );
             *
             *     $book = R::dispense("book");
             *     $page = R::dispense("page");
             *     $book->cover = $page;
             *
             *     R::store($book);
             *     $book = $book->fresh();
             *     $cover = $book->cover;
             *     echo $cover->getMeta("type"); // página.
             * </code>
             *
             * O formato da matriz de registro de aliases é:
             *     {alias} => {actual type}.
             *
             * No exemplo acima usamos:
             *     cover => page
             *
             * Desse ponto em diante, cada referência de bean a uma
             * capa retornará um bean de "página". Observe que com
             * autoResolve esse recurso junto com fetchAs() não é
             * mais muito importante, embora depender de aliases
             * explícitos possa ser um pouco mais rápido.
             *
             * @param array $list lista de aliases globais para usar.
             * @return void.
             */
            public static function aliases($list)
            {
                self::$aliases = $list;
            }

            /**
             * Lista de retorno de aliases globais.
             *
             * @return array.
             */
            public static function getAliases()
            {
                return self::$aliases;
            }

            /**
             * Sets a meta property for all beans. This is a quicker way to set
             * the meta properties for a collection of beans because this method
             * can directly access the property arrays of the beans.
             * This method returns the beans.
             *
             * @param array  $beans    beans to set the meta property of
             * @param string $property property to set
             * @param mixed  $value    value
             *
             * @return array
             */
            public static function setMetaAll( $beans, $property, $value )
            {
                foreach($beans as $bean)
                {
                    if ($bean instanceof OODBBean)
                    {
                        $bean->__info[$property] = $value;
                    }

                    if ($property == "type" && !empty($bean->beanHelper))
                    {
                        $bean->__info["model"] = $bean->beanHelper->getModelForBean($bean);
                    }
                }

                return $beans;
            }

            /**
             * Acessa a lista compartilhada de um bean. Para acessar
             * beans que foram associados ao bean atual usando um
             * relacionamento muitos para muitos, use sharedXList
             * onde X é o tipo de beans na lista.
             *
             * Uso:
             *     <code>
             *         $person = R::load( "person", $id );
             *         $friends = $person->sharedFriendList;
             *     </code>
             *
             * O trecho de código acima demonstra como obter todos
             * os beans do tipo "friend" que foram associados usando
             * uma relação N-M. Este é um método privado usado pelo
             * getter/accessor mágico. O exemplo ilustra o uso por
             * meio desses acessadores.
             *
             * @param string  $type    o nome da lista que você deseja recuperar.
             * @param OODB    $redbean instância da classe RedBeanPHP OODB.
             * @param ToolBox $toolbox instância do ToolBox (para obter acesso
             *                         aos objetos principais).
             *
             * @return array
             */
            private function getSharedList( $type, $redbean, $toolbox )
            {
                $writer = $toolbox->getWriter();
                if ($this->via)
                {
                    $oldName = $writer->getAssocTable(
                        array(
                            $this->__info["type"],
                            $type
                        )
                    );

                    if ($oldName !== $this->via)
                    {
                        /**
                         * Defina a nova regra de renomeação.
                         */
                        $writer->renameAssocTable(
                            $oldName,
                            $this->via
                        );
                    }

                    $this->via = NULL;
                }

                $beans = array();
                if ($this->getID())
                {
                    $type = $this->beau($type);
                    $assocManager = $redbean->getAssociationManager();
                    $beans = $assocManager->related(
                        $this,
                        $type,
                        $this->withSql,
                        $this->withParams
                    );
                }

                return $beans;
            }

            /**
             * Acessa a ownList. A lista "own" contém beans associados
             * usando uma relação um-para-muitos. As listas próprias
             * podem ser acessadas por meio da propriedade getter/setter
             * mágica ownXList, onde X é o tipo de bean nessa lista.
             *
             * Uso:
             *     <code>
             *         $book = R::load("book", $id);
             *         $pages = $book->ownPageList;
             *     </code>
             *
             * O exemplo acima demonstra como acessar as páginas
             * associadas ao livro. Como este é um método privado
             * destinado a ser usado pelos acessadores mágicos, o
             * exemplo usa o getter mágico.
             *
             * @param string $type  Nome da lista que você deseja recuperar.
             * @param OODB   $oodb  A instância do banco de dados de objetos RB OODB.
             *
             * @return array.
             */
            private function getOwnList($type, $redbean)
            {
                $type = $this->beau($type);

                if ($this->aliasName)
                {
                    $parentField = $this->aliasName;
                    $myFieldLink = $parentField . "_id";
                    $this->__info["sys.alias." . $type] = $this->aliasName;
                    $this->aliasName = NULL;
                } else
                {
                    $parentField = $this->__info["type"];
                    $myFieldLink = $parentField . "_id";
                }

                $beans = array();
                if ($this->getID())
                {
                    reset($this->withParams);
                    $firstKey = count($this->withParams) > 0
                        ? key($this->withParams)
                        : 0;

                    if (is_int($firstKey))
                    {
                        $sql = "{$myFieldLink} = ? {$this->withSql}";
                        $bindings = array_merge(
                            array(
                                $this->getID()
                            ),

                            $this->withParams
                        );
                    } else
                    {
                        $sql = "{$myFieldLink} = :slot0 {$this->withSql}";
                        $bindings = $this->withParams;
                        $bindings[":slot0"] = $this->getID();
                    }

                    $beans = $redbean->find($type, array(), $sql, $bindings);
                }

                foreach ($beans as $beanFromList)
                {
                    $beanFromList->__info["sys.parentcache." . $parentField] = $this;
                }

                return $beans;
            }

            /**
             * Inicializa um bean. Usado pela OODB para distribuição
             * de bean. Não é recomendado usar este método para
             * inicializar beans. Em vez disso, use o objeto OODB
             * para dispensar novos beans. Você pode usar esse método
             * se construir seu próprio mecanismo de distribuição de
             * bean. Isso não é recomendado.
             *
             * A menos que você saiba o que está fazendo, NÃO use este
             * método. Isto é apenas para usuários avançados !
             *
             * @param string          $type       tipo do novo bean.
             * @param BeanHelper|NULL $beanhelper bean helper para obter uma
             *                                    caixa de ferramentas e um
             *                                    modelo.
             *
             * @return void.
             */
            public function initializeForDispense($type, $beanhelper = NULL)
            {
                $this->beanHelper = $beanhelper;
                $this->__info["type"] = $type;
                $this->__info["sys.id"] = "id";
                $this->__info["sys.orig"] = array("id" => 0);
                $this->__info["tainted"] = true;
                $this->__info["changed"] = true;
                $this->__info["changelist"] = array();

                if ($beanhelper)
                {
                    $this->__info["model"] = $this->beanHelper->getModelForBean($this);
                }

                $this->properties["id"]   = 0;
            }

            /**
             * Define o Bean Helper. Normalmente o Bean Helper é
             * definido pelo OODB. Aqui você pode alterar o Bean
             * Helper. O Bean Helper é um objeto que fornece acesso
             * a uma caixa de ferramentas para o bean necessário
             * para recuperar beans aninhados (listas de beans:
             * ownBean, sharedBean) sem a necessidade de depender
             * de chamadas estáticas para a fachada (ou tornar esta
             * classe dependente do OODB).
             *
             * @param BeanHelper $helper ajudante a ser usado para este bean.
             * @return void.
             */
            public function setBeanHelper(BeanHelper $helper)
            {
                $this->beanHelper = $helper;
            }

            /**
             * Retorna um ArrayIterator para que você possa tratar
             * o bean como um array com o contêiner de propriedades
             * como seu conteúdo. Este método é destinado ao PHP e
             * permite acessar beans como se fossem arrays, ou seja,
             * usando notação de array:
             *
             * <code>
             *     $bean[$key] = $value;
             * </code>
             *
             * Observe que nem todas as funções PHP funcionam com
             * a interface array.
             *
             * @return \ArrayIterator.
             */
            #[\ReturnTypeWillChange]
            public function getIterator()
            {
                return new \ArrayIterator(
                    $this->properties
                );
            }

            /**
             * Importa todos os valores de um array associativo $array.
             * Acorrentável. Este método importa os valores no primeiro
             * argumento como pares de propriedades e valores do bean.
             * Use o segundo parâmetro para fornecer uma seleção. Se um
             * array de seleção for passado, apenas as entradas que
             * possuem chaves mencionadas no array de seleção serão
             * importadas. Defina o terceiro parâmetro como true para
             * preservar espaços nas chaves de seleção.
             *
             * @param array        $array     O que você deseja importar.
             * @param string|array $selection Seleção de valores
             * @param boolean      $notrim    Se as teclas de seleção true NÃO serão cortadas.
             *
             * @return OODBBean.
             */
            public function import($array, $selection = false, $notrim = false)
            {
                if (is_string($selection))
                {
                    $selection = explode(",", $selection);
                }

                if (is_array($selection))
                {
                    if ($notrim)
                    {
                        $selected = array_flip($selection);
                    } else
                    {
                        $selected = array();
                        foreach ($selection as $key => $select)
                        {
                            $selected[
                                trim($select)
                            ] = true;
                        }
                    }
                } else
                {
                    $selected = false;
                }

                foreach ($array as $key => $value)
                {
                    if ($key != "__info")
                    {
                        if (!$selected || isset($selected[$key]))
                        {
                            if (is_array($value))
                            {
                                if (isset($value["_type"]))
                                {
                                    $bean = $this
                                        ->beanHelper
                                        ->getToolbox()
                                        ->getRedBean()
                                        ->dispense($value["_type"]);

                                    unset($value["_type"]);
                                    $bean->import($value);
                                    $this->$key = $bean;
                                } else
                                {
                                    $listBeans = array();
                                    foreach($value as $listKey => $listItem)
                                    {
                                        $bean = $this
                                            ->beanHelper
                                            ->getToolbox()
                                            ->getRedBean()
                                            ->dispense($listItem["_type"]);

                                        unset($listItem["_type"]);
                                        $bean->import($listItem);
                                        $list = &$this->$key;
                                        $list[$listKey] = $bean;
                                    }
                                }
                            } else
                            {
                                $this->$key = $value;
                            }
                        }
                    }
                }

                return $this;
            }

            /**
             * O mesmo que import() mas corta todos os valores
             * por padrão. Defina o segundo parâmetro para aplicar
             * uma função diferente.
             *
             * @param array        $array     O que você deseja importar.
             * @param callable     $function  Função a ser aplicada (o padrão é trim).
             * @param string|array $selection Seleção de valores.
             * @param boolean      $notrim    Se as teclas de seleção true NÃO serão recortadas.
             *
             * @return OODBBean.
             */
            public function trimport($array, $function = "trim", $selection = false, $notrim = false)
            {
                return $this->import(
                    array_map(
                        $function,
                        $array
                    ),

                    $selection,
                    $notrim
                );
            }

            /**
             * Importa um array associativo diretamente para o array
             * de propriedades internas do bean, bem como para a meta
             * propriedade sys.orig e define o sinalizador alterado
             * como false. Isso é usado pelos objetos do repositório
             * para injetar linhas do banco de dados nos beans. Não é
             * recomendado usar este método fora de um repositório de
             * beans.
             *
             * @param array $row uma linha do banco de dados.
             * @return self.
             */
            public function importRow($row)
            {
                $this->properties = $row;
                $this->__info["sys.orig"] = $row;
                $this->__info["changed"] = false;
                $this->__info["changelist"] = array();

                return $this;
            }

            /**
             * Importa dados de outro bean. Acorrentável. Copia as
             * propriedades do bean de origem para a lista de
             * propriedades interna.
             *
             * Uso:
             *     <code>
             *         $copy->importFrom($bean);
             *     </code>
             *
             * O exemplo acima demonstra como fazer uma cópia
             * superficial de um bean usando o método
             * importFrom().
             *
             * @param OODBBean $sourceBean O bean de origem do qual obter propriedades.
             * @return OODBBean.
             */
            public function importFrom(OODBBean $sourceBean)
            {
                $this->__info["tainted"] = true;
                $this->__info["changed"] = true;
                $this->properties = $sourceBean->properties;

                return $this;
            }

            /**
             * Injeta as propriedades de outro bean, mas mantém
             * o ID original. Assim como import() mas mantém o
             * ID original. Acorrentável.
             *
             * @param OODBBean $otherBean O bean cujas propriedades você
             *                            gostaria de copiar.
             *
             * @return OODBBean.
             */
            public function inject(OODBBean $otherBean)
            {
                $myID = $this->properties["id"];
                $this->import($otherBean->export(false, false, true));
                $this->id = $myID;

                return $this;
            }

            /**
             * Exporta o bean como um array. Esta função exporta o
             * conteúdo de um bean para um array e retorna o array
             * resultante. Dependendo dos parâmetros você também
             * pode exportar um gráfico inteiro de beans, aplicar
             * filtros ou excluir metadados.
             *
             * Uso:
             *     <code>
             *         $bookData = $book->export(
             *             true,
             *             true,
             *             false,
             *             [
             *                 "author"
             *             ]
             *          );
             *     </code>
             *
             * O exemplo acima exporta todas as propriedades do bean
             * para um array chamado $bookData incluindo seus metadados,
             * objetos pai, mas sem nenhum beans do tipo "author".
             *
             * @param boolean $meta    Defina como true se desejar exportar metadados também.
             * @param boolean $parents Defina como true se desejar exportar os pais também.
             * @param boolean $onlyMe  Defina como true se desejar exportar apenas este bean.
             * @param array   $filters Lista de permissões opcional para exportação.
             *
             * @return array.
             */
            public function export($meta = false, $parents = false, $onlyMe = false, $filters = array())
            {
                $arr = array();
                if ($parents)
                {
                    foreach ($this as $key => $value)
                    {
                        if (substr($key, -3) != "_id")
                        {
                            continue;
                        }

                        $prop = substr($key, 0, strlen($key) - 3);
                        $this->$prop;
                    }
                }

                /**
                 *
                 */
                $hasFilters = is_array($filters) && count($filters);

                /**
                 *
                 */
                foreach ($this as $key => $value)
                {
                    if (!$onlyMe && is_array($value))
                    {
                        $vn = array();

                        foreach ($value as $i => $b)
                        {
                            if (!($b instanceof OODBBean))
                            {
                                continue;
                            }

                            $vn[] = $b->export($meta, false, false, $filters);
                            $value = $vn;
                        }
                    } elseif ($value instanceof OODBBean)
                    {
                        if ($hasFilters)
                        {
                            /**
                             * Tem que estar em uma linha, caso contrário,
                             * a cobertura de código será considerada
                             * errada.
                             */
                            if (!in_array(strtolower($value->getMeta("type")), $filters))
                            {
                                continue;
                            }
                        }

                        $value = $value->export($meta, $parents, false, $filters);
                    }

                    $arr[$key] = $value;
                }

                if ($meta)
                {
                    $arr["__info"] = $this->__info;
                }

                return $arr;
            }

            /**
             * Implementa a função isset() para uso como um array.
             * Isso permite que você use isset() nas propriedades
             * do bean.
             *
             * Uso:
             *     <code>
             *         $book->title = "my book";
             *         echo isset($book["title"]); // true
             *     </code>
             *
             * O exemplo ilustra como se pode aplicar a função isset()
             * a um bean.
             *
             * @param string $property Nome da propriedade que você deseja
             *                         verificar.
             *
             * @return boolean.
             */
            public function __isset($property)
            {
                $property = $this->beau($property);

                if (strpos($property, "xown") === 0 && ctype_upper(substr($property, 4, 1)))
                {
                    $property = substr($property, 1);
                }

                return isset(
                    $this->properties[$property]
                );
            }

            /**
             * Checks whether a related bean exists.
             * For instance if a post bean has a related author, this method
             * can be used to check if the author is set without loading the author.
             * This method works by checking the related ID-field.
             *
             * @param string $property name of the property you wish to check
             *
             * @return boolean
             */
            public function exists($property)
            {
                $property = $this->beau($property);

                /**
                 * Corrige o problema #549, consulte Teste
                 * Base/Bean.
                 */
                $hiddenRelationField = "{$property}_id";

                if (array_key_exists($hiddenRelationField, $this->properties))
                {
                    if (!is_null($this->properties[$hiddenRelationField]))
                    {
                        return true;
                    }
                }

                return false;
            }

            /**
             * Retorna o ID do bean. Se por algum motivo o ID não
             * tiver sido definido, este método retornará NULL. Na
             * verdade, isso é o mesmo que acessar a propriedade id
             * usando $bean->id. O ID de um bean é sua chave primária
             * e deve sempre corresponder a uma coluna da tabela
             * chamada "id".
             *
             * @return string|NULL
             */
            public function getID()
            {
                return (
                    isset(
                        $this->properties["id"]
                    )
                ) ? (string) $this->properties["id"] : NULL;
            }

            /**
             * Desativa uma propriedade de um bean. Método mágico,
             * é chamado implicitamente ao executar a operação
             * unset() em uma propriedade do bean.
             *
             * @param string $property propriedade a ser desativada.
             *
             * @return void.
             */
            public function __unset( $property )
            {
                $property = $this->beau($property);

                if (strpos($property, "xown") === 0 && ctype_upper(substr($property, 4, 1)))
                {
                    $property = substr($property, 1);
                }

                unset($this->properties[$property]);
                $shadowKey = "sys.shadow." . $property;

                if (isset($this->__info[$shadowKey]))
                {
                    unset($this->__info[$shadowKey]);
                }

                /**
                 * Também limpe modificadores.
                 */
                $this->clearModifiers();

                return;
            }

            /**
             * Retorna o bean envolvido em uma instância de qualquer
             * um. Isso permite ao usuário extrair dados do bean
             * usando uma cadeia de métodos sem nenhuma verificação
             * NULL, semelhante ao operador ??, mas também de uma
             * forma que seja compatível com versões mais antigas
             * do PHP. Para mais detalhes consulte a documentação
             * da classe Either.
             *
             * @return Either.
             */
            public function either()
            {
                return new Either($this);
            }

            /**
             * Adiciona condições da cláusula WHERE à recuperação
             * ownList. Por exemplo, para obter as páginas que
             * pertencem a um livro, você emitiria o seguinte
             * comando: $book->ownPage, No entanto, para ordenar
             * essas páginas por número,
             * use:
             *
             * <code>
             *     $book->with(" ORDER BY `number` ASC ")->ownPage
             * </code>
             *
             * O snippet SQL adicional será mesclado na consulta
             * final.
             *
             * @param string $sql      SQL a ser adicionado à consulta de
             *                         recuperação.
             *
             * @param array  $bindings Array com parâmetros para vincular ao
             *                         snippet SQL.
             *
             * @return OODBBean.
             */
            public function with($sql, $bindings = array())
            {
                $this->withSql = $sql;
                $this->withParams = $bindings;

                return $this;
            }

            /**
             * Assim como with(). Exceto que este método precede o
             * snippet de consulta SQL com AND, o que torna um pouco
             * mais confortável o uso de um snippet SQL condicional.
             * Por exemplo, para filtrar uma lista própria com páginas
             * (pertencentes a um livro) em capítulos específicos, você
             * pode usar:
             *
             * $book->withCondition(" chapter = 3 ")->ownPage.
             * 
             * Isso retornará na própria lista apenas as páginas
             * que possuem "chapter == 3".
             *
             * @param string $sql      SQL a ser adicionado à consulta de
             *                         recuperação (prefixado por AND).
             * @param array  $bindings array com parâmetros para vincular
             *                         ao snippet SQL.
             *
             * @return OODBBean.
             */
            public function withCondition($sql, $bindings = array())
            {
                $this->withSql = " AND " . $sql;
                $this->withParams = $bindings;

                return $this;
            }

            /**
             * Diz ao bean para (re)carregar a lista a seguir sem
             * quaisquer condições. Se você tiver uma ownList ou
             * sharedList com uma condição, poderá usar este método
             * para recarregar a lista inteira.
             *
             * Uso:
             *     <code>
             *         $bean->with(" LIMIT 3 ")->ownPage; // Apenas 3.
             *         $bean->all()->ownPage;             // Recarregue todas as páginas.
             *     </code>
             *
             * @return self.
             */
            public function all()
            {
                $this->all = true;

                return $this;
            }

            /**
             * Diz ao bean para acessar apenas a lista, mas não
             * carregar seu conteúdo. Use isto se você quiser
             * apenas adicionar algo a uma lista e não tiver
             * interesse em recuperar seu conteúdo do banco
             * de dados.
             *
             * Uso:
             *     <code>
             *         $book->noLoad()->ownPage[] = $newPage;
             *     </code>
             *
             * No exemplo acima, adicionamos o bean $newPage à lista
             * de páginas do livro sem carregar todas as páginas
             * primeiro. Se você sabe de antemão que não irá usar o
             * conteúdo da lista, você pode usar o modificador
             * noLoad() para garantir que as consultas necessárias
             * para carregar a lista não serão executadas.
             *
             * @return self.
             */
            public function noLoad()
            {
                $this->noLoad = true;

                return $this;
            }

            /**
             * Prepara uma lista própria para usar um alias. Isso
             * é melhor explicado usando um exemplo. Imagine um
             * projeto e uma pessoa. O projeto envolve sempre
             * duas pessoas: um professor e um aluno. Os beans
             * person foram alias neste caso, então o projeto tem
             * um teacher_id apontando para uma pessoa, e um
             * student_id também apontando para uma pessoa. Dado
             * um projeto, obtemos o professor assim:
             *
             * <code>
             *     $project->fetchAs("person")->teacher;
             * </code>
             *
             * Agora, se quisermos todos os projetos de um professor
             * não podemos dizer:
             *
             * <code>
             *     $teacher->ownProject;
             * </code>
             *
             * Porque o $teacher é um bean do tipo "pessoa" e nenhum
             * projeto foi atribuído a uma pessoa. Em vez disso, usamos
             * o método alias() assim:
             *
             * <code>
             *     $teacher->alias("teacher")->ownProject;
             * </code>
             *
             * Agora temos os projetos associados à pessoa bean
             * com o apelido de professor.
             *
             * @param string $aliasName O nome alternativo a ser usado.
             * @return OODBBean.
             */
            public function alias($aliasName)
            {
                $this->aliasName = $this->beau(
                    $aliasName
                );

                return $this;
            }

            /**
             * Retorna propriedades do bean como um array. Este método
             * retorna a lista bruta de propriedades internas do bean.
             * Use este método apenas para fins de otimização. Caso
             * contrário, use o método export() para exportar dados
             * do bean para arrays.
             *
             * @return array.
             */
            public function getProperties()
            {
                return $this->properties;
            }

            /**
             * Retorna propriedades do bean como um array. Este
             * método retorna a lista bruta de propriedades internas
             * do bean. Use este método apenas para fins de otimização.
             * Caso contrário, use o método export() para exportar
             * dados do bean para arrays. Este método retorna um array
             * com o array de propriedades e o tipo (string).
             *
             * @return array.
             */
            public function getPropertiesAndType()
            {
                return array(
                    $this->properties,
                    $this->__info["type"]
                );
            }

            /**
             * Transforma um nome de propriedade camelcase em um
             * nome de propriedade sublinhado.
             *
             * Exemplos:
             *     - oneACLRoute -> one_acl_route.
             *     - camelCase -> camel_case.
             *
             * Também armazena em cache o resultado para melhorar
             * o desempenho.
             *
             * @param string $property imóvel para desembelezar.
             * @return string.
             */
            public function beau($property)
            {
                static $beautifulColumns = array();

                if (ctype_lower($property))
                {
                    return $property;
                }

                if ((strpos($property, "own") === 0 && ctype_upper(substr($property, 3, 1))) ||
                    (strpos($property, "xown") === 0 && ctype_upper(substr($property, 4, 1))) ||
                    (strpos($property, "shared") === 0 && ctype_upper(substr($property, 6, 1))))
                {
                    $property = preg_replace('/List$/', "", $property);

                    return $property;
                }

                if (!isset($beautifulColumns[$property]))
                {
                    $beautifulColumns[$property] = AQueryWriter::camelsSnake($property);
                }

                return $beautifulColumns[$property];
            }

            /**
             * Modificadores são um conceito poderoso no RedBeanPHP,
             * eles tornam possível alterar a forma como uma propriedade
             * deve ser carregada. RedBeanPHP usa modificadores de
             * propriedade usando uma notação de prefixo como esta:
             *
             * <code>
             *     $book->fetchAs("page")->cover;
             * </code>
             *
             * Aqui carregamos um bean do tipo page, identificado pela
             * propriedade cover (ou cover_id no banco de dados). Como
             * o modificador é chamado antes da propriedade ser acessada,
             * o modificador deve ser lembrado de alguma forma, isso
             * altera o estado do bean. Acessar uma propriedade faz com
             * que o bean limpe seus modificadores. Para limpar os
             * modificadores manualmente, você pode usar este método.
             *
             * Uso:
             *     <code>
             *         $book->with( "LIMIT 1" );
             *         $book->clearModifiers()->ownPageList;
             *     </code>
             *
             * No exemplo acima, a cláusula "LIMIT 1" é limpa antes de
             * acessar as páginas do livro, fazendo com que todas as
             * páginas sejam carregadas na lista em vez de apenas
             * uma.
             *
             * @return self.
             */
            public function clearModifiers()
            {
                $this->withSql = "";
                $this->withParams = array();
                $this->aliasName = NULL;
                $this->fetchType = NULL;
                $this->noLoad = false;
                $this->all = false;
                $this->via = NULL;
                $this->castProperty = NULL;

                return $this;
            }

            /**
             * Determina se uma lista é aberta em modo exclusivo ou
             * não. Se uma lista foi aberta em modo exclusivo este
             * método retornará true, caso contrário retornará
             * false.
             *
             * @param string $listName nome da lista a ser verificada.
             * @return boolean.
             */
            public function isListInExclusiveMode($listName)
            {
                $listName = $this->beau($listName);

                if (strpos($listName, "xown") === 0 && ctype_upper(substr($listName, 4, 1)))
                {
                    $listName = substr($listName, 1);
                }

                $listName = lcfirst(substr($listName, 3));
                return (
                    isset(
                        $this->__info["sys.exclusive-".$listName]
                    ) && $this->__info["sys.exclusive-".$listName]
                );
            }

            /**
             * Obturador Mágico. Obtém o valor de uma propriedade
             * específica no bean. Se a propriedade não existir,
             * este getter garantirá que nenhum erro ocorra. Isso
             * ocorre porque o RedBean permite consultar propriedades
             * (probe). Se a propriedade não puder ser encontrada,
             * este método retornará NULL.
             *
             * Uso:
             *     <code>
             *         $title = $book->title;
             *         $pages = $book->ownPageList;
             *         $tags  = $book->sharedTagList;
             *     </code>
             *
             * O exemplo acima lista várias maneiras de invocar o
             * getter mágico. Você pode usar o configurador mágico
             * para acessar propriedades, listas próprias, listas
             * próprias exclusivas (xownLists) e listas
             * compartilhadas.
             *
             * @param string $property nome do imóvel cujo valor deseja obter.
             * @return mixed.
             */
            public function &__get($property)
            {
                $isEx = false;
                $isOwn = false;
                $isShared = false;

                if (!ctype_lower($property))
                {
                    $property = $this->beau($property);

                    if (strpos($property, "xown") === 0 && ctype_upper(substr($property, 4, 1)))
                    {
                        $property = substr($property, 1);
                        $listName = lcfirst( substr( $property, 3 ) );
                        $isEx = true;
                        $isOwn = true;
                        $this->__info["sys.exclusive-".$listName] = true;
                    } elseif (strpos($property, "own") === 0 && ctype_upper(substr($property, 3, 1)))
                    {
                        $isOwn = true;
                        $listName = lcfirst(substr($property, 3));
                    } elseif (strpos($property, "shared") === 0 && ctype_upper(substr($property, 6, 1)))
                    {
                        $isShared = true;
                    }
                }

                $fieldLink = $property . "_id";
                $exists = isset($this->properties[$property]);

                /**
                 * Se não existir e não houver link de campo e nenhuma
                 * lista, resgate.
                 */
                if (!$exists && !isset($this->$fieldLink) && (!$isOwn && !$isShared))
                {
                    $this->clearModifiers();

                    /**
                     * Git issue:
                     * Remova $NULL para retornar diretamente NULL #625.
                     * @@ -1097,8 +1097,7 @@ public function &__get($property)
                     *     $this->all = false;
                     *     $this->via = NULL;
                     *
                     * - $NULL = NULL;
                     * - return $NULL;
                     * + return NULL;
                     *
                     * Leva à regressão:
                     * PHP Stack trace:
                     * PHP 1. {main}() testje.php:0
                     * PHP 2. RedBeanPHP\OODBBean->__get() testje.php:22
                     * Aviso: Somente referências de variáveis devem ser
                     *        retornadas por referência em redbean.php na
                     *        linha 2529.
                     */
                    $NULL = NULL;

                    /**
                     *
                     */
                    return $NULL;
                }

                /**
                 *
                 */
                $hasAlias = (!is_null($this->aliasName));
                $differentAlias = ($hasAlias && $isOwn && isset($this->__info["sys.alias.".$listName])) ? ($this->__info["sys.alias.".$listName] !== $this->aliasName) : false;

                $hasSQL = ($this->withSql !== "" || $this->via !== NULL);
                $hasAll = (boolean) ($this->all);

                /**
                 * Se existir e nenhuma lista ou saída e a lista
                 * não for alterada, resgate.
                 */
                if ($exists && ((!$isOwn && !$isShared) || (!$hasSQL && !$differentAlias && !$hasAll)))
                {
                    $castProperty = $this->castProperty;
                    $this->clearModifiers();

                    if (!is_null($castProperty))
                    {
                        $object = new $castProperty(
                            $this->properties[$property]
                        );

                        return $object;
                    }

                    return $this->properties[$property];
                }

                /**
                 *
                 */
                list($redbean, , , $toolbox) = $this->beanHelper->getExtractedToolbox();

                /**
                 * Se for outro bean, carregamos e retornamos.
                 */
                if (isset($this->$fieldLink))
                {
                    $this->__info["tainted"] = true;

                    if (isset($this->__info["sys.parentcache.$property"]))
                    {
                        $bean = $this->__info["sys.parentcache.$property"];
                    } else
                    {
                        if (isset(self::$aliases[$property]))
                        {
                            $type = self::$aliases[$property];
                        } elseif ($this->fetchType)
                        {
                            $type = $this->fetchType;
                            $this->fetchType = NULL;
                        } else
                        {
                            $type = $property;
                        }

                        $bean = NULL;
                        if (!is_null($this->properties[$fieldLink]))
                        {
                            $bean = $redbean->load(
                                $type,
                                $this->properties[$fieldLink]
                            );
                        }
                    }

                    $this->properties[$property] = $bean;
                    $this->clearModifiers();

                    return $this->properties[$property];
                }

                /**
                 * Implícito: elseif ($isOwn || $isShared).
                 */
                if ($this->noLoad)
                {
                    $beans = array();
                } elseif ($isOwn)
                {
                    $beans = $this->getOwnList($listName, $redbean);
                } else
                {
                    $beans = $this->getSharedList(
                        lcfirst(
                            substr($property, 6)
                        ),

                        $redbean,
                        $toolbox
                    );
                }

                $this->properties[$property] = $beans;
                $this->__info["sys.shadow.$property"] = $beans;
                $this->__info["tainted"] = true;
                $this->clearModifiers();

                return $this->properties[$property];
            }

            /**
             * Setter Mágico. Define o valor de uma propriedade
             * específica. Este setter atua como um hook para o
             * OODB marcar os grãos como contaminados. A meta
             * propriedade contaminada pode ser recuperada
             * usando getMeta("tainted"). A meta propriedade
             * contaminada indica se um bean foi modificado e
             * pode ser usado em vários mecanismos de cache.
             *
             * @param string $property Nome da propriedade à qual você deseja atribuir um valor.
             * @param  mixed $value    O valor que você deseja atribuir.
             *
             * @return void.
             */
            public function __set($property, $value)
            {
                $isEx = false;
                $isOwn = false;
                $isShared = false;

                if (!ctype_lower($property))
                {
                    $property = $this->beau($property);

                    if (strpos($property, "xown") === 0 && ctype_upper(substr($property, 4, 1)))
                    {
                        $property = substr($property, 1);
                        $listName = lcfirst(substr($property, 3));

                        $isEx = true;
                        $isOwn = true;
                        $this->__info["sys.exclusive-".$listName] = true;
                    } elseif (strpos($property, "own") === 0 && ctype_upper(substr($property, 3, 1)))
                    {
                        $isOwn = true;
                        $listName = lcfirst(
                            substr($property, 3)
                        );
                    } elseif (strpos($property, "shared") === 0 && ctype_upper(substr($property, 6, 1)))
                    {
                        $isShared = true;
                    }
                } elseif (self::$convertArraysToJSON && is_array($value))
                {
                    $value = json_encode($value);
                }

                $hasAlias = (!is_null($this->aliasName));
                $differentAlias = ($hasAlias && $isOwn && isset($this->__info["sys.alias.".$listName])) ? ($this->__info["sys.alias.".$listName] !== $this->aliasName) : false;

                $hasSQL = ($this->withSql !== "" || $this->via !== NULL);
                $exists = isset($this->properties[$property]);
                $fieldLink = $property . "_id";
                $isFieldLink = (
                    (
                        $pos = strrpos($property, "_id")
                    ) !== false
                ) && array_key_exists(($fieldName = substr($property, 0, $pos)), $this->properties);

                if (($isOwn || $isShared) &&  (!$exists || $hasSQL || $differentAlias))
                {
                    if (!$this->noLoad)
                    {
                        list($redbean, , , $toolbox) = $this->beanHelper->getExtractedToolbox();

                        if ($isOwn)
                        {
                            $beans = $this->getOwnList($listName, $redbean);
                        } else
                        {
                            $beans = $this->getSharedList(
                                lcfirst(
                                    substr($property, 6)
                                ), $redbean, $toolbox
                            );
                        }

                        $this->__info["sys.shadow.$property"] = $beans;
                    }
                }

                $this->clearModifiers();
                $this->__info["tainted"] = true;
                $this->__info["changed"] = true;

                array_push(
                    $this->__info["changelist"],
                    $property
                );

                if (array_key_exists($fieldLink, $this->properties) && !($value instanceof OODBBean))
                {
                    if (is_null($value) || $value === false)
                    {
                        unset($this->properties[$property]);
                        $this->properties[$fieldLink] = NULL;

                        return;
                    } else
                    {
                        throw new RedException("Cannot cast to bean.");
                    }
                }

                if ($isFieldLink)
                {
                    unset($this->properties[$fieldName]);
                    $this->properties[$property] = NULL;
                }

                if ($value === false)
                {
                    $value = "0";
                } elseif ($value === true)
                {
                    $value = "1";

                    /**
                     * Por algum motivo, há algum tipo de bug no xdebug
                     * para que ele não conte esta linha de outra
                     * forma ...
                     */
                } elseif ((($value instanceof \DateTime) or ($value instanceof \DateTimeInterface)))
                {
                    $value = $value->format("Y-m-d H:i:s");
                }

                $this->properties[$property] = $value;
            }

            /**
             * @deprecated
             *
             * Define uma propriedade do bean permitindo que você
             * mesmo acompanhe o estado. Este método define uma
             * propriedade do bean e permite controlar como o
             * estado do bean será afetado.
             *
             * Embora possa haver algumas circunstâncias em que este
             * método seja necessário, este método é considerado
             * extremamente perigoso. Este método é apenas para
             * usuários avançados.
             *
             * @param string  $property     Propriedade.
             * @param mixed   $value        Valor.
             * @param boolean $updateShadow Se você deseja atualizar a sombra.
             * @param boolean $taint        Se você deseja marcar o bean como tainted.
             *
             * @return void.
             */
            public function setProperty($property, $value, $updateShadow = false, $taint = false)
            {
                $this->properties[$property] = $value;

                if ($updateShadow)
                {
                    $this->__info["sys.shadow." . $property] = $value;
                }

                if ($taint)
                {
                    $this->__info["tainted"] = true;
                    $this->__info["changed"] = true;
                }
            }

            /**
             * Retorna o valor de uma metapropriedade. Uma
             * metapropriedade contém informações adicionais sobre
             * o objeto bean que não serão armazenadas no banco de
             * dados. Meta informações são usadas para instruir o
             * RedBeanPHP, bem como outros sistemas, sobre como
             * lidar com o bean. Se a propriedade não puder ser
             * encontrada, este getter retornará NULL.
             *
             * Exemplo:
             *     <code>
             *         $bean->setMeta("flush-cache", true);
             *     </code>
             *
             * RedBeanPHP também armazena metadados em beans, esses
             * metadados usam chaves prefixadas com "sys." (sistema).
             *
             * @param string $path    Caminho para propriedade em metadados.
             * @param mixed  $default Valor padrão.
             * @return mixed.
             */
            public function getMeta($path, $default = NULL)
            {
                return (
                    isset(
                        $this->__info[$path]
                    )
                ) ? $this->__info[$path] : $default;
            }

            /**
             * Retorna um valor do pacote de dados. O pacote de dados
             * pode conter dados adicionais enviados de uma consulta
             * SQL, por exemplo, o número total de linhas. Se a
             * propriedade não puder ser encontrada, o valor padrão
             * será retornado. Se nenhum padrão tiver sido especificado,
             * este método retornará NULL.
             *
             * @param string $key     chave.
             * @param mixed  $default padrão (padrões para NULL).
             * @return mixed;
             */
            public function info($key, $default = NULL)
            {
                return (
                    isset(
                        $this->__info["data.bundle"][$key]
                    )
                ) ? $this->__info["data.bundle"][$key] : $default;
            }

            /**
             * Obtém e desativa uma meta propriedade. Move uma
             * metapropriedade para fora do bean. Este é um
             * método de atalho que pode ser usado em vez de
             * combinar get/unset.
             *
             * @param string $path    Caminho para propriedade em metadados.
             * @param mixed  $default Valor padrão.
             * @return mixed.
             */
            public function moveMeta($path, $value = NULL)
            {
                if (isset($this->__info[$path]))
                {
                    $value = $this->__info[$path];
                    unset(
                        $this->__info[$path]
                    );
                }

                return $value;
            }

            /**
             * Armazena um valor na propriedade de meta informações
             * especificada. O primeiro argumento deve ser a chave
             * para armazenar o valor, o segundo argumento deve ser
             * o valor. É comum usar uma notação semelhante a um
             * caminho para metadados no RedBeanPHP como: "my.meta.data",
             * porém os pontos são puramente para facilitar a leitura,
             * os métodos de metadados não armazenam estruturas ou
             * hierarquias aninhadas.
             *
             * @param string $path  Caminho/chave para armazenar o valor em.
             * @param mixed  $value Valor para armazenar no bean (não no
             *                      banco de dados) como metadados.
             *
             * @return OODBBean.
             */
            public function setMeta($path, $value)
            {
                $this->__info[$path] = $value;

                if ($path == "type" && !empty($this->beanHelper))
                {
                    $this->__info["model"] = $this->beanHelper->getModelForBean($this);
                }

                return $this;
            }

            /**
             * Copia as metainformações do bean especificado. Este
             * é um método conveniente para permitir que você troque
             * metainformações facilmente.
             *
             * @param OODBBean $bean bean para copiar metadados.
             * @return OODBBean.
             */
            public function copyMetaFrom(OODBBean $bean)
            {
                $this->__info = $bean->__info;

                return $this;
            }

            /**
             * Captura um elenco dinâmico. Permite obter um valor
             * de bean como um objeto, sugerindo o tipo do objeto
             * de retorno desejado usando asX, onde X é a classe
             * que você deseja usar como wrapper para a
             * propriedade.
             *
             * Uso:
             *     $dateTime = $bean->asDateTime()->date;
             *
             * @param string $method method (asXXX)...
             * @return self|NULL.
             */
            public function captureDynamicCasting($method)
            {
                if (strpos($method, "as") === 0 && ctype_upper(substr($method, 2, 1)) === true)
                {
                    $this->castProperty = substr($method, 2);

                    return $this;
                }

                return NULL;
            }

            /**
             * Envia a chamada para o modelo cadastrado. Este método
             * também pode ser usado para substituir o comportamento
             * do bean. Nesse caso, você não deseja que um erro ou
             * exceção seja acionado se o método não existir no modelo
             * (porque é opcional). Infelizmente não podemos adicionar
             * um argumento extra a __call() para isso porque a assinatura
             * é fixa. Outra opção seria definir um sinalizador especial
             * (ou seja, $this->isOptionalCall), mas isso causaria
             * complexidade adicional porque temos que lidar com um
             * estado temporário extra. Então, em vez disso, permiti
             * que o nome do método fosse prefixado com "@", na prática
             * ninguém cria métodos assim - porém o símbolo "@" em PHP
             * é amplamente conhecido por suprimir o tratamento de erros,
             * então podemos reutilizar a semântica deste símbolo. Se um
             * nome de método for passado começando com "@", a variável
             * overrideDontFail será definida como true e "@" será
             * removido do nome da função antes de tentar invocar o
             * método no modelo. Dessa forma, temos toda a lógica em um
             * só lugar.
             *
             * @param string $method Nome do método.
             * @param array  $args   Lista de argumentos.
             * @return mixed.
             */
            public function __call($method, $args)
            {
                if (empty($this->__info["model"]))
                {
                    return $this->captureDynamicCasting($method);
                }

                $overrideDontFail = false;
                if (strpos($method, "@") === 0)
                {
                    $method = substr($method, 1);
                    $overrideDontFail = true;
                }

                if (!is_callable(array($this->__info["model"], $method)))
                {
                    $self = $this->captureDynamicCasting($method);

                    if ($self)
                    {
                        return $self;
                    }

                    if (self::$errorHandlingFUSE === false || $overrideDontFail)
                    {
                        return NULL;
                    }

                    if (in_array($method, array("update", "open", "delete", "after_delete", "after_update", "dispense"), true))
                    {
                        return NULL;
                    }

                    $message = "FUSE: method does not exist in model: $method";

                    if (self::$errorHandlingFUSE === self::C_ERR_LOG)
                    {
                        error_log($message);

                        return NULL;
                    } elseif (self::$errorHandlingFUSE === self::C_ERR_NOTICE)
                    {
                        trigger_error( $message, E_USER_NOTICE );

                        return NULL;
                    } elseif (self::$errorHandlingFUSE === self::C_ERR_WARN)
                    {
                        trigger_error($message, E_USER_WARNING);

                        return NULL;
                    } elseif (self::$errorHandlingFUSE === self::C_ERR_EXCEPTION)
                    {
                        throw new \Exception($message);
                    } elseif (self::$errorHandlingFUSE === self::C_ERR_FUNC)
                    {
                        $func = self::$errorHandler;
                        return $func(array(
                            "message" => $message,
                            "method" => $method,
                            "args" => $args,
                            "bean" => $this
                        ));
                    }

                    trigger_error($message, E_USER_ERROR);

                    return NULL;
                }

                return call_user_func_array(
                    array(
                        $this->__info["model"],
                        $method
                    ),

                    $args
                );
            }

            /**
             * Implementação do método __toString. Encaminha a chamada
             * para o modelo. Se o modelo implementar um método __toString()
             * este método será chamado e o resultado será retornado. No
             * caso de uma instrução echo este resultado será impresso. Se
             * o modelo não implementar um método __toString, este método
             * retornará uma representação JSON do bean atual.
             *
             * @return string.
             */
            public function __toString()
            {
                $string = $this->__call("@__toString", array());

                if ($string === NULL)
                {
                    $list = array();
                    foreach($this->properties as $property => $value)
                    {
                        if (is_scalar($value))
                        {
                            if (self::$enforceUTF8encoding)
                            {
                                $list[$property] = mb_convert_encoding($value, "UTF-8", "UTF-8");
                            } else
                            {
                                $list[$property] = $value;
                            }
                        }
                    }

                    /**
                     *
                     */
                    $data = json_encode($list);

                    /**
                     *
                     */
                    return $data;
                } else
                {
                    return $string;
                }
            }

            /**
             * Implementação da interface de acesso ao array, você
             * pode acessar objetos bean como um array. A chamada
             * é roteada para __set.
             *
             * @param  mixed $offset Sequência de deslocamento.
             * @param  mixed $value  Valor.
             * @return void.
             */
            #[\ReturnTypeWillChange]
            public function offsetSet($offset, $value)
            {
                $this->__set($offset, $value);
            }

            /**
             * Implementação da interface de acesso ao array, você
             * pode acessar objetos bean como um array.
             *
             * As funções de array não revelam x-own-lists e list-alias
             * porque você não deseja entradas duplicadas em loops
             * foreach. Também oferece uma ligeira melhoria de
             * desempenho para acesso ao array.
             *
             * @param  mixed $offset propriedade.
             * @return boolean.
             */
            #[\ReturnTypeWillChange]
            public function offsetExists($offset)
            {
                return $this->__isset($offset);
            }

            /**
             * Implementação da interface de acesso ao array, você
             * pode acessar objetos bean como um array. Desconfigura
             * um valor do array/bean.
             *
             * As funções de array não revelam x-own-lists e list-alias
             * porque você não deseja entradas duplicadas em loops
             * foreach. Também oferece uma ligeira melhoria de
             * desempenho para acesso ao array.
             *
             * @param  mixed $offset propriedade.
             * @return void.
             */
            #[\ReturnTypeWillChange]
            public function offsetUnset($offset)
            {
                $this->__unset($offset);
            }

            /**
             * Implementação da interface de acesso ao array, você
             * pode acessar objetos bean como um array. Retorna o
             * valor de uma propriedade.
             *
             * As funções de array não revelam x-own-lists e list-alias
             * porque você não deseja entradas duplicadas em loops
             * foreach. Também oferece uma ligeira melhoria de
             * desempenho para acesso ao array.
             *
             * @param  mixed $offset propriedade.
             * @return mixed.
             */
            #[\ReturnTypeWillChange]
            public function &offsetGet($offset)
            {
                return $this->__get($offset);
            }

            /**
             * Método encadeado para converter um determinado ID em
             * um bean; por exemplo:
             *     $person = $club->fetchAs("person")->member;
             *
             * Isso carregará um bean do tipo pessoa usando member_id
             * como ID.
             *
             * @param  string $type tipo de busca preferido.
             * @return OODBBean.
             */
            public function fetchAs($type)
            {
                $this->fetchType = $type;

                return $this;
            }

            /**
             * Prepara para carregar um bean usando o tipo de bean
             * especificado por outra propriedade. Semelhante a
             * fetchAs, mas usa uma coluna em vez de um valor
             * direto.
             *
             * Uso:
             *     <code>
             *         $car = R::load("car", $id);
             *         $engine = $car->poly("partType")->part;
             *     </code>
             *
             * No exemplo acima, temos um bean do tipo carro que pode
             * ser composto por várias partes (ou seja, chassis, rodas).
             * Para obter o "motor" acessamos a propriedade "part"
             * usando o tipo (ou seja, motor) especificado pela propriedade
             * indicada pelo argumento de poly(). Esta é essencialmente
             * uma relação polimórfica, daí o nome. No banco de dados
             * esta relação pode ficar assim:
             *
             * +----------+---------+
             * | partType | part_id |
             * +----------+---------+
             * | engine   | 1020300 |
             * | wheel    | 4820088 |
             * | chassis  | 7823122 |
             * +----------+---------+
             *
             * @param string $field nome do campo a ser usado para mapeamento.
             * @return OODBBean.
             */
            public function poly($field)
            {
                return $this->fetchAs($this->$field);
            }

            /**
             * Percorre uma propriedade do bean com a função especificada.
             * Itera recursivamente pela propriedade invocando a função
             * para cada bean ao longo do caminho, passando o bean para
             * ele. Pode ser usado junto com with, withCondition, alias
             * e fetchAs.
             *
             * <code>
             *     $task
             *         ->withCondition(" priority >= ? ", [ $priority ])
             *         ->traverse("ownTaskList", function($t) use (&$todo)
             *         {
             *             $todo[] = $t->descr;
             *         });
             * </code>
             *
             * No exemplo, criamos uma lista de tarefas percorrendo
             * uma lista hierárquica de tarefas enquanto filtramos
             * todas as tarefas de baixa prioridade.
             *
             * @param string $property property.
             * @param callable $function function.
             * @param integer|NULL $maxDepth profundidade máxima para travessia.
             *
             * @return OODBBean.
             * @throws RedException.
             */
            public function traverse($property, $function, $maxDepth = NULL, $depth = 1)
            {
                $this->via = NULL;
                if (strpos($property, "shared") !== false)
                {
                    throw new RedException(
                        "Traverse only works with (x)own-lists."
                    );
                }

                if (!is_null($maxDepth))
                {
                    if (!$maxDepth--)
                    {
                        return $this;
                    }
                }

                $oldFetchType = $this->fetchType;
                $oldAliasName = $this->aliasName;
                $oldWith = $this->withSql;
                $oldBindings  = $this->withParams;
                $beans = $this->$property;

                if ($beans === NULL)
                {
                    return $this;
                }

                if (!is_array($beans))
                {
                    $beans = array($beans);
                }

                foreach($beans as $bean)
                {
                    $function($bean, $depth);
                    $bean->fetchType = $oldFetchType;
                    $bean->aliasName = $oldAliasName;
                    $bean->withSql = $oldWith;
                    $bean->withParams = $oldBindings;
                    $bean->traverse(
                        $property,
                        $function,
                        $maxDepth,
                        $depth + 1
                    );
                }

                return $this;
            }

            /**
             * Implementação da interface Contável. Torna possível
             * usar a função count() em um bean. Este método é invocado
             * se você usar a função count() em um bean. O método count()
             * retornará o número de propriedades do bean, isso inclui a
             * propriedade id.
             *
             * Uso:
             *     <code>
             *         $bean = R::dispense("bean");
             *         $bean->property1 = 1;
             *         $bean->property2 = 2;
             *
             *         //
             *         // Imprime 3 (porque id também é uma propriedade).
             *         //
             *         echo count($bean);
             *     </code>
             *
             * O exemplo acima irá imprimir o número 3 em stdout. Embora
             * tenhamos atribuído valores a apenas duas propriedades, a
             * chave primária id também é uma propriedade do bean e,
             * juntos, resulta em 3. Além de usar a função count(),
             * você também pode chamar esse método usando uma notação
             * de método: $bean->count().
             *
             * @return integer.
             */
            #[\ReturnTypeWillChange]
            public function count()
            {
                return count(
                    $this->properties
                );
            }

            /**
             * Verifica se um bean está vazio ou não. Um bean está
             * vazio se não tiver outras propriedades além do campo
             * id OU se todas as outras propriedades forem "empty()"
             * (isso pode incluir valores NULL e false).
             *
             * Uso:
             *     <code>
             *         $newBean = R::dispense("bean");
             *
             *         //
             *         // true.
             *         //
             *         $newBean->isEmpty();
             *     </code>
             *
             * O exemplo acima demonstra que os grãos recém-distribuídos
             * são considerados “vazios”.
             *
             * @return boolean.
             */
            public function isEmpty()
            {
                $empty = true;
                foreach ($this->properties as $key => $value)
                {
                    if ($key == "id")
                    {
                        continue;
                    }

                    if (!empty($value))
                    {
                        $empty = false;
                    }
                }

                return $empty;
            }

            /**
             * Setter encadeável. Este método é na verdade o
             * mesmo que definir um valor usando um setter
             * mágico (->property = ...). A diferença é que
             * você pode encadear esses setters assim:
             *
             * Uso:
             *     <code>
             *         $book
             *             ->setAttr("title", "mybook")
             *             ->setAttr("author", "me");
             *     </code>
             *
             * Isto é o mesmo que definir ambas as propriedades $book->title
             * e $book->author. Às vezes, uma notação encadeada pode melhorar
             * a legibilidade do código.
             *
             * @param string $property A propriedade do bean.
             * @param mixed  $value    O valor que você deseja definir.
             * @return OODBBean.
             */
            public function setAttr($property, $value)
            {
                $this->$property = $value;

                return $this;
            }

            /**
             * Método de conveniência. Desativa todas as propriedades
             * no vetor de propriedades internas.
             *
             * Uso:
             *     <code>
             *         $bean->property = 1;
             *         $bean->unsetAll(array("property"));
             *         $bean->property; // NULL
             *     </code>
             *
             * No exemplo acima, a "propriedade" do bean não será
             * definida, resultando no retorno do getter NULL em
             * vez de 1.
             *
             * @param array $properties propriedades que você deseja
             *                          cancelar.
             *
             * @return OODBBean.
             */
            public function unsetAll($properties)
            {
                foreach ($properties as $prop)
                {
                    if (isset($this->properties[$prop]))
                    {
                        unset($this->properties[$prop]);
                    }
                }

                return $this;
            }

            /**
             * Retorna o valor original (antigo) de uma propriedade.
             * Você pode usar este método para ver o que mudou em um
             * bean. O valor original de uma propriedade é o valor
             * que esta propriedade possui desde que o bean foi
             * recuperado dos bancos de dados.
             *
             * <code>
             *     $book->title = "new title";
             *     $oldTitle = $book->old("title");
             * </code>
             *
             * O exemplo mostra como usar o método old(). Aqui definimos
             * a propriedade title do bean como "new title", então obtemos
             * o valor original usando old("title") e o armazenamos em uma
             * variável $oldTitle.
             *
             * @param string $property Nome da propriedade da qual você
             *                         deseja o valor antigo.
             *
             * @return mixed.
             */
            public function old($property)
            {
                $old = $this->getMeta("sys.orig", array());

                if (array_key_exists($property, $old))
                {
                    return $old[$property];
                }

                return NULL;
            }

            /**
             * Método de conveniência.
             *
             * Retorna true se o bean foi alterado ou false caso
             * contrário. O mesmo que $bean->getMeta("tainted");
             * Observe que um bean fica contaminado assim que
             * você recupera uma lista do bean. Isso ocorre
             * porque as listas de beans são arrays e o bean não
             * pode determinar se você fez modificações em uma
             * lista, então o RedBeanPHP marcará todo o bean
             * como contaminado.
             *
             * @return boolean.
             */
            public function isTainted()
            {
                return $this->getMeta("tainted");
            }

            /**
             * Retorna true se o valor de uma determinada propriedade
             * do bean foi alterado e false caso contrário.
             *
             * Observe que este método retornará true se aplicado a
             * uma lista carregada. Observe também que este método
             * mantém registro do histórico do bean, independentemente
             * de ele ter sido armazenado ou não. Armazenar um bean
             * não desfaz seu histórico, para limpar o histórico de um
             * bean use: clearHistory().
             *
             * @param string  $property Nome da propriedade cujo status de
             *                          alteração você deseja.
             *
             * @return boolean.
             */
            public function hasChanged($property)
            {
                return (
                    array_key_exists(
                        $property,
                        $this->properties
                    )
                ) ? $this->old($property) != $this->properties[$property] : false;
            }

            /**
             * Retorna true se a lista especificada existir, tiver
             * sido carregada e alterada: beans foram adicionados
             * ou excluídos. Este método não dirá nada sobre o
             * estado dos beans na lista.
             *
             * Uso:
             *     <code>
             *         //
             *         // false.
             *         //
             *         $book->hasListChanged("ownPage");
             *
             *         //
             *         //
             *         //
             *         array_pop(
             *             $book->ownPageList
             *         );
             *
             *         //
             *         // true.
             *         //
             *         $book->hasListChanged("ownPage");
             *     </code>
             *
             * No exemplo, a primeira vez que perguntamos se a lista
             * de páginas próprias foi alterada, obtemos false. Em
             * seguida, abrimos uma página da lista e o método
             * hasListChanged() retorna true.
             *
             * @param string $property Nome da lista a ser verificada.
             * @return boolean.
             */
            public function hasListChanged($property)
            {
                if (!array_key_exists($property, $this->properties))
                {
                    return false;
                }

                $diffAdded = array_diff_assoc(
                    $this->properties[$property],
                    $this->__info["sys.shadow.".$property]
                );

                if (count($diffAdded))
                {
                    return true;
                }

                $diffMissing = array_diff_assoc(
                    $this->__info["sys.shadow.".$property],
                    $this->properties[$property]
                );

                if (count($diffMissing))
                {
                    return true;
                }

                return false;
            }

            /**
             * Limpa (sincroniza) o histórico do bean. Redefine
             * todos os valores de sombra do bean para seus
             * valores atuais.
             *
             * Uso:
             *     <code>
             *              $book->title = "book";
             *         echo $book->hasChanged("title"); // true.
             *
             *         R::store($book);
             *
             *         echo $book->hasChanged("title"); // true.
             *              $book->clearHistory();
             *         echo $book->hasChanged("title"); // false.
             *     </code>
             *
             * Observe que mesmo após store(), o histórico do bean
             * ainda contém o ato de alterar o título do livro.
             * Somente após invocar clearHistory() o histórico
             * do bean será limpo e hasChanged() retornará
             * false.
             *
             * @return self.
             */
            public function clearHistory()
            {
                $this->__info["sys.orig"] = array();
                foreach($this->properties as $key => $value)
                {
                    if (is_scalar($value))
                    {
                        $this->__info["sys.orig"][$key] = $value;
                    } else
                    {
                        $this->__info["sys.shadow.".$key] = $value;
                    }
                }

                $this->__info["changelist"] = array();
                return $this;
            }

            /**
             * Cria uma relação N-M vinculando um bean intermediário.
             * Este método pode ser usado para conectar beans rapidamente
             * usando relações indiretas. Por exemplo, dado um álbum e
             * uma música, você pode conectar os dois usando uma faixa
             * com um número como este:
             *
             * Uso:
             *     <code>
             *         $album->link("track", array("number" => 1))->song = $song;
             *     </code>
             *
             * ou:
             *     <code>
             *         $album->link($trackBean)->song = $song;
             *     </code>
             *
             * O que este método faz é adicionar o bean de link
             * à lista própria, neste caso ownTrack. Se o primeiro
             * argumento for uma string e o segundo for um array ou
             * uma string JSON, o bean de ligação será distribuído
             * instantaneamente, como visto no exemplo nº 1. Após
             * preparar o bean de ligação, o bean é retornado
             * permitindo assim o setter encadeado: ->song = $song.
             *
             * @param string|OODBBean $typeOrBean    Tipo de bean a dispensar ou o bean inteiro.
             * @param string|array    $qualification String ou vetor JSON (opcional).
             * @return OODBBean.
             */
            public function link($typeOrBean, $qualification = array())
            {
                if (is_string($typeOrBean))
                {
                    $typeOrBean = AQueryWriter::camelsSnake($typeOrBean);
                    $bean = $this
                        ->beanHelper
                        ->getToolBox()
                        ->getRedBean()
                        ->dispense($typeOrBean);

                    if (is_string($qualification))
                    {
                        $data = json_decode($qualification, true);
                    } else
                    {
                        $data = $qualification;
                    }

                    foreach ($data as $key => $value)
                    {
                        $bean->$key = $value;
                    }
                } else
                {
                    $bean = $typeOrBean;
                }

                $list = "own" . ucfirst($bean->getMeta("type"));
                array_push(
                    $this->$list,
                    $bean
                );

                return $bean;
            }

            /**
             * Retorna um bean do tipo fornecido com o mesmo ID do
             * bean atual. Isso só acontece em uma relação um-para-um.
             * Isto é até onde vai o suporte para 1-1 no RedBeanPHP.
             * Este método retornará apenas uma referência ao bean,
             * alterá-lo e armazenar o bean não atualizará o bean
             * relacionado.
             *
             * Uso:
             *     <code>
             *         $author = R::load("author", $id);
             *         $biography = $author->one("bio");
             *     </code>
             *
             * O exemplo carrega a biografia associada ao autor usando
             * uma relação um-para-um. Estas relações geralmente não são
             * criadas (nem suportadas) pelo RedBeanPHP.
             *
             * @param  $type tipo de bean a ser carregado.
             * @return OODBBean.
             */
            public function one($type)
            {
                return $this->beanHelper
                    ->getToolBox()
                    ->getRedBean()
                    ->load(
                        $type,
                        $this->id
                    );
            }

            /**
             * Recarrega o bean. Retorna o mesmo bean recém-carregado
             * do banco de dados. Este método é igual ao seguinte
             * código:
             *
             * <code>
             *     $id = $bean->id;
             *     $type = $bean->getMeta("type");
             *     $bean = R::load($type, $id);
             * </code>
             *
             * Este é apenas um método conveniente para recarregar
             * beans rapidamente.
             *
             * Uso:
             *     <code>
             *         R::exec(...update query...);
             *         $book = $book->fresh();
             *     </code>
             *
             * O trecho de código acima ilustra como obter alterações
             * causadas por uma consulta UPDATE, simplesmente recarregando
             * o bean usando o método fresh().
             *
             * @return OODBBean.
             */
            public function fresh()
            {
                return $this->beanHelper
                    ->getToolbox()
                    ->getRedBean()
                    ->load(
                        $this->getMeta("type"),
                        $this->properties["id"]
                    );
            }

            /**
             * Registra uma associação renomeada globalmente. Use via()
             * e link() para associar beans compartilhados usando um
             * terceiro bean que atuará como um tipo intermediário. Por
             * exemplo, considere um funcionário e um projeto. Poderíamos
             * associar funcionários a projetos usando uma sharedEmployeeList.
             * Mas talvez haja mais no relacionamento do que apenas a
             * associação. Talvez queiramos qualificar a relação entre
             * um projeto e um funcionário com uma função: "developer",
             * "designer", "tester" e assim por diante. Nesse caso, talvez
             * seja melhor introduzir um novo conceito para refletir isto:
             * o participante. No entanto, ainda queremos flexibilidade
             * para consultar nossos funcionários de uma só vez. É aqui
             * que link() e via() podem ajudar. Você ainda pode introduzir
             * o conceito mais aplicável (participante) e ter acesso fácil
             * aos beans compartilhados.
             *
             * <code>
             *     $Anna = R::dispense("employee");
             *     $Anna->badge   = "Anna";
             *
             *     $project = R::dispense("project");
             *     $project->name = "x";
             *
             *     $Anna->link(
             *         "participant",
             *         array(
             *             "arole" => "developer"
             *         )
             *     )->project = $project;
             *
             *     R::storeAll(
             *         array(
             *             $project,
             *             $Anna
             *         )
             *     );
             *
             *     $employees = $project
             *         ->with(" ORDER BY badge ASC ")
             *         ->via( "participant" )
             *         ->sharedEmployee;
             * </code>
             *
             * This piece of code creates a project and an employee.
             * It then associates the two using a via-relation called
             * "participant" ( employee <-> participant <-> project ).
             * So, there will be a table named "participant" instead of
             * a table named "employee_project". Using the via() method, the
             * employees associated with the project are retrieved "via"
             * the participant table (and an SQL snippet to order them by badge).
             *
             * @param string $via tipo que você deseja usar para listas
             *                    compartilhadas.
             *
             * @return OODBBean.
             */
            public function via( $via )
            {
                $this->via = AQueryWriter::camelsSnake($via);

                return $this;
            }

            /**
             * Conta todos os beans próprios do tipo $type. Também
             * funciona com alias(), with() e withCondition(). Own-beans
             * ou xOwn-beans (bean de propriedade exclusiva) são
             * beans que foram associados usando uma relação
             * um-para-muitos. Eles podem ser acessados através do
             * ownXList onde X é o tipo dos beans associados.
             *
             * Uso:
             *     <code>
             *         $Bill
             *             ->alias("author")
             *             ->countOwn("book");
             *     </code>
             *
             * O exemplo acima conta todos os livros associados
             * ao "author" $Bill.
             *
             * @param string $type O tipo de bean que você deseja contar.
             * @return integer.
             */
            public function countOwn($type)
            {
                $type = $this->beau($type);

                if ($this->aliasName)
                {
                    $myFieldLink = $this->aliasName . "_id";
                    $this->aliasName = NULL;
                } else
                {
                    $myFieldLink = $this->__info["type"] . "_id";
                }

                $count = 0;
                if ($this->getID())
                {
                    reset($this->withParams);
                    $firstKey = count(
                        $this->withParams
                    ) > 0 ? key($this->withParams) : 0;

                    if (is_int($firstKey))
                    {
                        $sql = "{$myFieldLink} = ? {$this->withSql}";
                        $bindings = array_merge(
                            array(
                                $this->getID()
                            ),

                            $this->withParams
                        );
                    } else
                    {
                        $sql = "{$myFieldLink} = :slot0 {$this->withSql}";
                        $bindings = $this->withParams;
                        $bindings[":slot0"] = $this->getID();
                    }

                    if (!self::$useFluidCount)
                    {
                        $count = $this
                            ->beanHelper
                            ->getToolbox()
                            ->getWriter()
                            ->queryRecordCount(
                                $type, array(), $sql, $bindings
                            );
                    } else
                    {
                        $count = $this
                            ->beanHelper
                            ->getToolbox()
                            ->getRedBean()
                            ->count(
                                $type,
                                $sql,
                                $bindings
                            );
                    }
                }

                /**
                 *
                 */
                $this->clearModifiers();

                /**
                 *
                 */
                return (int) $count;
            }

            /**
             * Conta todos os beans compartilhados do tipo $type.
             * Também funciona com via(), with() e withCondition().
             * Beans compartilhados são beans que possuem uma relação
             * muitos para muitos. Eles podem ser acessados usando
             * sharedXList, onde X é o tipo do bean compartilhado.
             *
             * Uso:
             *     <code>
             *         $book = R::dispense("book");
             *         $book->sharedPageList = R::dispense("page", 5);
             *
             *         R::store($book);
             *         echo $book->countShared("page");
             *     </code>
             *
             * O trecho de código acima produzirá "5", porque
             * existem 5 beans do tipo "página" na lista
             * compartilhada.
             *
             * @param string $type tipo de feijão que você deseja contar.
             * @return integer.
             */
            public function countShared($type)
            {
                $toolbox = $this->beanHelper->getToolbox();
                $redbean = $toolbox->getRedBean();
                $writer = $toolbox->getWriter();

                if ($this->via)
                {
                    $oldName = $writer
                        ->getAssocTable(
                            array(
                                $this->__info["type"],
                                $type
                            )
                        );

                    if ($oldName !== $this->via)
                    {
                        /**
                         * Defina a nova regra de renomeação.
                         */
                        $writer->renameAssocTable($oldName, $this->via);
                        $this->via = NULL;
                    }
                }

                $type = $this->beau($type);
                $count = 0;

                if ($this->getID())
                {
                    $count = $redbean
                        ->getAssociationManager()
                        ->relatedCount(
                            $this,
                            $type,
                            $this->withSql,
                            $this->withParams
                        );
                }

                /**
                 *
                 */
                $this->clearModifiers();

                /**
                 *
                 */
                return (integer) $count;
            }

            /**
             * Itera através da lista própria especificada e busca
             * todas as propriedades (com seu tipo) e retorna as
             * referências. Use este método para carregar rapidamente
             * beans indiretamente relacionados em uma lista própria.
             * Sempre que você não puder usar uma lista compartilhada,
             * este método oferece a mesma conveniência agregando os
             * beans pais de todos os filhos na lista própria
             * especificada.
             *
             * Exemplo:
             *     <code>
             *         $quest->aggr(
             *             "xownQuestTarget",
             *             "target",
             *             "quest"
             *         );
             *     </code>
             *
             * Carrega (em lote) e retorna referências a todos os
             * quest beans que residem nas propriedades
             * $questTarget->target de cada elemento no
             * xownQuestTargetList.
             *
             * @param string      $list     A lista que você deseja processar.
             * @param string      $property A propriedade a ser carregada.
             * @param string|NULL $type     O tipo de bean residente nesta
             *                              propriedade (opcional).
             *
             * @return array.
             */
            public function &aggr( $list, $property, $type = NULL )
            {
                $this->via = NULL;
                $ids = $beanIndex = $references = array();

                if (strlen($list) < 4)
                {
                    throw new RedException("Invalid own-list.");
                }

                if (strpos($list, "own") !== 0)
                {
                    throw new RedException("Only own-lists can be aggregated.");
                }

                if (!ctype_upper(substr($list, 3, 1)))
                {
                    throw new RedException("Invalid own-list.");
                }

                if (is_null($type))
                {
                    $type = $property;
                }

                foreach ($this->$list as $bean)
                {
                    $field = $property . "_id";
                    if (isset($bean->$field))
                    {
                        $ids[] = $bean->$field;
                        $beanIndex[$bean->$field] = $bean;
                    }
                }

                /**
                 *
                 */
                $beans = $this
                    ->beanHelper
                    ->getToolBox()
                    ->getRedBean()
                    ->batch(
                        $type,
                        $ids
                    );

                /**
                 * Agora pré-carregue os grãos também.
                 */
                foreach($beans as $bean)
                {
                    $beanIndex[$bean->id]->setProperty($property, $bean);
                }

                foreach($beanIndex as $indexedBean)
                {
                    $references[] = $indexedBean->$property;
                }

                return $references;
            }

            /**
             * Testa se as identidades do banco de dados de dois
             * beans são iguais. Dois beans são considerados "iguais"
             * se:
             *     a. Os tipos de feijão combinam.
             *     b. Os IDs dos beans correspondem.
             *
             * Retorna true se os beans forem considerados iguais de
             * acordo com esta especificação e false caso contrário.
             *
             * Uso:
             *     <code>
             *         $coffee->fetchAs("flavour")->taste->equals(
             *             R::enum("flavour:mocca")
             *         );
             *     </code>
             *
             * O exemplo acima compara o rótulo do sabor "mocca" com
             * o rótulo do sabor anexado ao grão de $coffee. Isso
             * ilustra como usar equals() com enums no estilo
             * RedBeanPHP.
             *
             * @param OODBBean|null $bean outro feijão.
             * @return boolean.
             */
            public function equals(OODBBean $bean)
            {
                if (is_null($bean))
                {
                    return false;
                }

                return (bool) (
                    ((string) $this->properties["id"] === (string) $bean->properties["id"]) &&
                    ((string) $this->__info["type"] === (string) $bean->__info["type"])
                );
            }

            /**
             * Método mágico jsonSerialize, implementação da
             * interface \JsonSerializable, este método é
             * chamado por json_encode e facilita uma melhor
             * representação JSON do bean. Exporta o bean na
             * serialização JSON, para os fãs JSON.
             *
             * Os modelos podem substituir jsonSerialize (problema
             * nº 651) implementando um método __jsonSerialize que
             * deve retornar um array. A substituição __jsonSerialize
             * é chamada com o modificador @ para evitar erros ou
             * avisos.
             *
             * @see  https://www.php.net/manual/en/class.jsonserializable.php.
             * @return array.
             */
            #[\ReturnTypeWillChange]
            public function jsonSerialize()
            {
                $json = $this->__call("@__jsonSerialize", array());

                if ($json !== NULL)
                {
                    return $json;
                }

                return $this->export();
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\Observer as Observer;


        /**
         * Observável.
         * Classe base para observáveis.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        abstract class Observable
        {
            /**
             * O colchete deve estar aqui - caso contrário, o
             * software de cobertura não entende.
             */

            /**
             * @var array
             */
            private $observers = array();

            /**
             * Implementação do Padrão Observador. Adiciona um ouvinte
             * de evento ao objeto observável. O primeiro argumento
             * deve ser o nome do evento que você deseja ouvir. O
             * segundo argumento deve ser o objeto que deseja ser
             * notificado caso o evento ocorra.
             *
             * @param string   $eventname Identificador de evento.
             * @param Observer $observer  Instância do observador.
             *
             * @return void
             */
            public function addEventListener($eventname, Observer $observer)
            {
                if (!isset($this->observers[$eventname]))
                {
                    $this->observers[$eventname] = array();
                }

                if (in_array($observer, $this->observers[$eventname]))
                {
                    return;
                }

                $this->observers[$eventname][] = $observer;
            }

            /**
             * Notifica os ouvintes. Envia o sinal $eventname, o
             * identificador do evento e um objeto de mensagem
             * para todos os observadores que foram cadastrados
             * para receber notificação deste evento. Parte da
             * implementação do padrão observador no RedBeanPHP.
             *
             * @param string $eventname Evento que você quer sinal.
             * @param mixed  $info      Objeto de mensagem para enviar junto.
             * @return void.
             */
            public function signal($eventname, $info)
            {
                if (!isset($this->observers[$eventname]))
                {
                    $this->observers[$eventname] = array();
                }

                foreach ($this->observers[$eventname] as $observer)
                {
                    $observer->onEvent(
                        $eventname,
                        $info
                    );
                }
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        /**
         * Observer.
         *
         * Interface para objeto Observer. Implementação do
         * padrão observador.
         *
         * @desc Parte do padrão observador no RedBean.
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        interface Observer
        {
            /**
             * Um objeto observador precisa ser capaz de receber
             * notificações. Portanto o observador precisa implementar
             * o método onEvent com dois parâmetros: o identificador do
             * evento especificando o evento atual e um objeto de
             * mensagem (no RedBeanPHP este também pode ser um
             * bean).
             *
             * @param string $eventname Identificador do evento.
             * @param mixed  $bean      Uma mensagem enviada junto com a notificação.
             * @return void.
             */
            public function onEvent($eventname, $bean);
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        /**
         * Interface do adaptador. Descreve a API para um
         * adaptador de banco de dados RedBeanPHP. Esta
         * interface define o contrato API para um adaptador
         * de banco de dados RedBeanPHP.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        interface Adapter
        {
            /**
             * Should retorna uma sequência contendo a consulta
             * SQL mais recente que foi processada pelo
             * adaptador.
             *
             * @return string
             */
            public function getSQL();

            /**
             * Executa uma instrução SQL usando uma matriz de
             * valores para vincular. Se $noevent for true,
             * então esta função não sinalizará seus observadores
             * para notificar sobre a execução do SQL; isso
             * para evitar recursão infinita ao usar
             * observadores.
             *
             * @param string  $sql      String contendo código SQL para banco de dados.
             * @param array   $bindings Vetor de valores para vincular aos parâmetros
             *                          na string de consulta.
             * @param boolean $noevent  Nenhum evento disparando.
             * @return int.
             */
            public function exec($sql, $bindings = array(), $noevent = false);

            /**
             * Executa uma consulta SQL e retorna um conjunto de
             * resultados. Este método retorna um conjunto de
             * resultados multidimensional semelhante a getAll. A
             * matriz de valores pode ser usada para vincular
             * valores aos marcadores na consulta SQL.
             *
             * @param string $sql      String contendo código SQL para banco
             *                         de dados.
             * @param array  $bindings Vetor de valores para vincular aos
             *                         parâmetros na string de consulta.
             * @return array.
             */
            public function get($sql, $bindings = array());

            /**
             * Executa uma consulta SQL e retorna um conjunto de
             * resultados. Este método retorna um conjunto de
             * resultados de uma única linha (um vetor). O vetor
             * de valores pode ser usada para vincular valores
             * aos marcadores na consulta SQL.
             *
             * @param string $sql      String contendo código SQL para banco de dados.
             * @param array  $bindings Vetor de valores para vincular aos parâmetros
             *                         na string de consulta.
             * @return array|NULL.
             */
            public function getRow($sql, $bindings = array());

            /**
             * Executa uma consulta SQL e retorna um conjunto de
             * resultados. Este método retorna um conjunto de
             * resultados de uma única coluna (um vetor). O vetor
             * de valores pode ser usada para vincular valores
             * aos marcadores na consulta SQL.
             *
             * @param string $sql      String contendo código SQL para banco
             *                         de dados.
             * @param array  $bindings Vetor de valores para vincular aos
             *                         parâmetros na string de consulta.
             * @return array.
             */
            public function getCol($sql, $bindings = array());

            /**
             * Executa uma consulta SQL e retorna um conjunto de
             * resultados. Este método retorna uma única célula,
             * um valor escalar como conjunto de resultados. A
             * matriz de valores pode ser usada para vincular
             * valores aos marcadores na consulta SQL.
             *
             * @param string $sql      String contendo código SQL para banco de dados.
             * @param array  $bindings Vetor de valores para vincular aos parâmetros
             *                         na string de consulta.
             * @return string|NULL.
             */
            public function getCell($sql, $bindings = array());

            /**
             * Executa a consulta SQL especificada em $sql e
             * indexa a linha pela primeira coluna.
             *
             * @param string $sql      String contendo código SQL para banco
             *                         de dados.
             * @param array  $bindings Vetor de valores para vincular aos
             *                         parâmetros na string de consulta.
             * @return array.
             */
            public function getAssoc($sql, $bindings = array());

            /**
             * Executa a consulta SQL especificada em $sql e
             * retorna um array associativo onde os nomes das
             * colunas são as chaves.
             *
             * @param string $sql      String contendo código SQL para databaseQL.
             * @param array  $bindings Valores a serem vinculados.
             * @return array.
             */
            public function getAssocRow($sql, $bindings = array());

            /**
             * Retorna o ID de inserção mais recente.
             *
             * @return integer.
             */
            public function getInsertID();

            /**
             * Retorna o número de linhas que foram afetadas pela
             * última instrução de atualização.
             *
             * @return integer.
             */
            public function getAffectedRows();

            /**
             * Retorna um objeto Cursor independente de banco de dados.
             *
             * @param string $sql      String contendo código SQL para banco
             *                         de dados.
             * @param array  $bindings Vetor de valores para vincular aos
             *                         parâmetros na string de consulta.
             * @return Cursor.
             */
            public function getCursor($sql, $bindings = array());

            /**
             * Retorna o recurso de banco de dados original. Isso
             * é útil se você quiser executar operações diretamente
             * no driver, em vez de trabalhar com o adaptador. O
             * RedBean acessará apenas o adaptador e nunca falará
             * diretamente com o driver.
             *
             * @return Driver.
             */
            public function getDatabase();

            /**
             * Este método faz parte dos mecanismos de gerenciamento
             * de transações RedBean. Inicia uma transação.
             *
             * @return void.
             */
            public function startTransaction();

            /**
             * Este método faz parte dos mecanismos de gerenciamento
             * de transações RedBean. Confirma a transação.
             *
             * @return void.
             */
            public function commit();

            /**
             * Este método faz parte dos mecanismos de gerenciamento
             * de transações RedBean. Reverte a transação.
             *
             * @return void.
             */
            public function rollback();

            /**
             * Fecha a conexão com o banco de dados.
             *
             * @return void
             */
            public function close();

            /**
             * Define uma opção específica do driver. Usando este
             * método você pode acessar funções específicas do
             * driver. Se a opção selecionada existir o valor será
             * passado e este método retornará o booleano true,
             * caso contrário retornará o booleano false.
             *
             * @param string $optionKey   Opção chave.
             * @param string $optionValue Opção valor.
             *
             * @return boolean
             */
            public function setOption($optionKey, $optionValue);

            /**
             * Retorna a string da versão do servidor de banco
             * de dados.
             *
             * @return string.
             */
            public function getDatabaseServerVersion();
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\Adapter
    {
        use RedBeanPHP\Observable as Observable;
        use RedBeanPHP\Adapter as Adapter;
        use RedBeanPHP\Driver as Driver;


        /**
         * DBAdapter (Database Adapter).
         *
         * Uma classe adaptadora para conectar vários sistemas de
         * banco de dados ao RedBean. Classe de adaptador de banco
         * de dados. A tarefa da classe do adaptador de banco de
         * dados é comunicar-se com o driver de banco de dados. Você
         * pode usar todos os tipos de drivers de banco de dados com
         * RedBeanPHP. O driver de banco de dados padrão fornecido
         * com a biblioteca RedBeanPHP é o driver RPDO (que usa a
         * PHP Data Objects Architecture, também conhecida como
         * PDO).
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class DBAdapter extends Observable implements Adapter
        {
            /**
             * @var Driver.
             */
            private $db = NULL;

            /**
             * @var string.
             */
            private $sql = "";

            /**
             * Construtor.
             *
             * Cria uma instância da classe do adaptador RedBean.
             * Esta classe fornece uma interface para RedBean
             * funcionar com instâncias de banco de dados
             * compatíveis com ADO.
             *
             * Uso:
             *     <code>
             *         $database = new RPDO($dsn, $user, $pass);
             *         $adapter = new DBAdapter($database);
             *         $writer = new PostgresWriter($adapter);
             *         $oodb = new OODB($writer, false);
             *
             *         $bean = $oodb->dispense("bean");
             *         $bean->name = "coffeeBean";
             *
             *         $id = $oodb->store($bean);
             *         $bean = $oodb->load("bean", $id);
             *     </code>
             *
             * O exemplo acima cria os 3 objetos principais do
             * RedBeanPHP: o Adaptador, o Query Writer e a
             * instância OODB e os conecta. O exemplo também
             * demonstra alguns dos métodos que podem ser usados
             * com OODB, como você pode ver, eles se assemelham
             * muito aos seus equivalentes de fachada.
             *
             * O processo de ligação: crie uma instância RPDO
             * usando os parâmetros de conexão do banco de dados.
             * Crie um adaptador de banco de dados a partir do
             * objeto RPDO e passe-o para o construtor do
             * gravador. Em seguida, crie uma instância OODB
             * do gravador. Agora você tem um objeto OODB.
             *
             * @param Driver $database Instância de banco de dados compatível com ADO.
             */
            public function __construct($database)
            {
                $this->db = $database;
            }

            /**
             * Retorna uma string contendo a consulta SQL mais recente
             * processada pelo adaptador de banco de dados, em conformidade
             * com a interface:
             *
             * @see Adapter::getSQL.
             *
             * Métodos como get(), getRow() e exec() fazem com
             * que esse cache SQL seja preenchido. Se nenhuma
             * consulta SQL tiver sido processada ainda, esta
             * função retornará uma string vazia.
             *
             * @return string.
             */
            public function getSQL()
            {
                return $this->sql;
            }

            /**
             * @see Adapter::exec.
             */
            public function exec($sql, $bindings = array(), $noevent = false)
            {
                if (!$noevent)
                {
                    $this->sql = $sql;
                    $this->signal("sql_exec", $this);
                }

                return $this->db->Execute(
                    $sql,
                    $bindings
                );
            }

            /**
             * @see Adapter::get.
             */
            public function get( $sql, $bindings = array() )
            {
                $this->sql = $sql;
                $this->signal("sql_exec", $this);

                return $this->db->GetAll(
                    $sql,
                    $bindings
                );
            }

            /**
             * @see Adapter::getRow.
             */
            public function getRow($sql, $bindings = array())
            {
                $this->sql = $sql;
                $this->signal("sql_exec", $this);

                return $this->db->GetRow(
                    $sql,
                    $bindings
                );
            }

            /**
             * @see Adapter::getCol.
             */
            public function getCol($sql, $bindings = array())
            {
                $this->sql = $sql;
                $this->signal("sql_exec", $this);

                return $this->db->GetCol(
                    $sql,
                    $bindings
                );
            }

            /**
             * @see Adapter::getAssoc.
             */
            public function getAssoc($sql, $bindings = array())
            {
                $this->sql = $sql;
                $this->signal("sql_exec", $this);
                $rows  = $this->db->GetAll($sql, $bindings);

                if (!$rows)
                {
                    return array();
                }

                $assoc = array();
                foreach ($rows as $row)
                {
                    if (empty($row))
                    {
                        continue;
                    }

                    $key = array_shift($row);
                    switch (count($row))
                    {
                        case 0:
                            $value = $key;
                            break;

                        case 1:
                            $value = reset($row);
                            break;

                        default:
                            $value = $row;
                    }

                    $assoc[$key] = $value;
                }

                return $assoc;
            }

            /**
             * @see Adapter::getAssocRow.
             */
            public function getAssocRow($sql, $bindings = array())
            {
                $this->sql = $sql;
                $this->signal("sql_exec", $this);

                return $this->db->GetAssocRow(
                    $sql,
                    $bindings
                );
            }

            /**
             * @see Adapter::getCell.
             */
            public function getCell($sql, $bindings = array(), $noSignal = NULL)
            {
                $this->sql = $sql;

                if (!$noSignal)
                {
                    $this->signal("sql_exec", $this);
                }

                return $this->db->GetOne(
                    $sql,
                    $bindings
                );
            }

            /**
             * @see Adapter::getCursor.
             */
            public function getCursor($sql, $bindings = array())
            {
                return $this->db->GetCursor(
                    $sql,
                    $bindings
                );
            }

            /**
             * @see Adapter::getInsertID.
             */
            public function getInsertID()
            {
                return $this->db->getInsertID();
            }

            /**
             * @see Adapter::getAffectedRows.
             */
            public function getAffectedRows()
            {
                return $this->db->Affected_Rows();
            }

            /**
             * @see Adapter::getDatabase.
             */
            public function getDatabase()
            {
                return $this->db;
            }

            /**
             * @see Adapter::startTransaction.
             */
            public function startTransaction()
            {
                $this->db->StartTrans();
            }

            /**
             * @see Adapter::commit.
             */
            public function commit()
            {
                $this->db->CommitTrans();
            }

            /**
             * @see Adapter::rollback.
             */
            public function rollback()
            {
                $this->db->FailTrans();
            }

            /**
             * @see Adapter::close.
             */
            public function close()
            {
                $this->db->close();
            }

            /**
             * Define o código de inicialização para conexão.
             *
             * @param callable $code.
             */
            public function setInitCode($code)
            {
                $this->db->setInitCode($code);
            }

            /**
             * @see Adapter::setOption.
             */
            public function setOption($optionKey, $optionValue)
            {
                if (method_exists($this->db, $optionKey))
                {
                    call_user_func(
                        array(
                            $this->db,
                            $optionKey
                        ),

                        $optionValue
                    );

                    return true;
                }

                return false;
            }

            /**
             * @see Adapter::getDatabaseServerVersion.
             */
            public function getDatabaseServerVersion()
            {
                return $this->db->DatabaseServerVersion();
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        /**
         * Database Cursor Interface.
         *
         * Um cursor é usado pelos Query Writers para buscar
         * as linhas do Resultado da Consulta, uma linha por
         * vez. Isto é útil se você espera que o conjunto de
         * resultados seja muito grande. Esta interface descreve
         * a API de um cursor de banco de dados. Pode haver
         * múltiplas implementações do Cursor, por padrão o
         * RedBeanPHP oferece o PDOCursor para drivers
         * fornecidos com o RedBeanPHP e o NULLCursor.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        interface Cursor
        {
            /**
             * Deve recuperar a próxima linha do conjunto de
             * resultados. Este método é usado para iterar no
             * conjunto de resultados.
             *
             * @return array|NULL.
             */
            public function getNextItem();

            /**
             * Redefine o cursor fechando-o e executando novamente
             * a instrução. Isso recarrega dados novos do banco de
             * dados para toda a coleção.
             *
             * @return void.
             */
            public function reset();

            /**
             * Fecha o cursor do banco de dados. Alguns bancos
             * de dados exigem que um cursor seja fechado antes
             * de executar outra instrução/abrir um novo cursor.
             *
             * @return void.
             */
            public function close();
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\Cursor
    {
        use RedBeanPHP\Cursor as Cursor;


        /**
         * PDO Database Cursor.
         *
         * Implementação do Cursor de Banco de Dados PDO. Usado
         * pelo BeanCollection para buscar um bean por vez. O
         * Cursor PDO é usado por Query Writers para suportar
         * a recuperação de grandes coleções de beans. Por
         * exemplo, esta classe é usada para implementar a
         * funcionalidade findCollection()/BeanCollection.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class PDOCursor implements Cursor
        {
            /**
             * @var \PDOStatement.
             */
            protected $res;

            /**
             * @var string.
             */
            protected $fetchStyle;

            /**
             * Construtor, cria uma nova instância de um Cursor
             * de Banco de Dados PDO.
             *
             * @param \PDOStatement $res        A declaração PDO.
             * @param string        $fetchStyle Buscar constante de estilo para usar.
             * @return void.
             */
            public function __construct(\PDOStatement $res, $fetchStyle)
            {
                $this->res = $res;
                $this->fetchStyle = $fetchStyle;
            }

            /**
             * @see Cursor::getNextItem.
             */
            public function getNextItem()
            {
                return $this->res->fetch();
            }

            /**
             * @see Cursor::reset.
             */
            public function reset()
            {
                $this->close();
                $this->res->execute();
            }

            /**
             * @see Cursor::close.
             */
            public function close()
            {
                $this->res->closeCursor();
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\Cursor
    {
        use RedBeanPHP\Cursor as Cursor;


        /**
         * NULL Database Cursor.
         *
         * Implementação do Cursor NULL. Usado para um
         * BeanCollection vazio. Este Cursor pode ser
         * usado, por exemplo, se uma consulta falhar,
         * mas a interface exige que um cursor seja
         * retornado.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class NullCursor implements Cursor
        {
            /**
             * @see Cursor::getNextItem.
             */
            public function getNextItem()
            {
                return NULL;
            }

            /**
             * @see Cursor::reset.
             */
            public function reset()
            {
                return NULL;
            }

            /**
             * @see Cursor::close.
             */
            public function close()
            {
                return NULL;
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\Cursor as Cursor;
        use RedBeanPHP\Repository as Repository;


        /**
         * BeanCollection.
         *
         * O BeanCollection representa uma coleção de beans e
         * possibilita o uso de cursores de banco de dados. O
         * BeanCollection possui um método next() para obter
         * o primeiro, o próximo e o último bean da coleção.
         * O BeanCollection não implementa a interface de
         * array nem tenta agir como um array porque não pode
         * retroceder ou retroceder.
         *
         * Use BeanCollection para grandes conjuntos de dados
         * onde ignorar/limitar não é uma opção. Tenha em
         * mente que a marcação de ID (consultar um ID
         * inicial) é uma alternativa decente.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class BeanCollection
        {
            /**
             * @var Cursor.
             */
            protected $cursor = NULL;

            /**
             * @var Repository.
             */
            protected $repository = NULL;

            /**
             * @var string.
             */
            protected $type = NULL;

            /**
             * @var string.
             */
            protected $mask = NULL;

            /**
             * Construtor, cria uma nova instância do BeanCollection.
             *
             * @param string     $type       Tipo de bean nesta coleção.
             * @param Repository $repository Repositório a ser usado para gerar objetos bean.
             * @param Cursor     $cursor     Objeto cursor a ser usado.
             * @param string     $mask       Meta máscara a ser aplicada (opcional).
             * @return void.
             */
            public function __construct($type, Repository $repository, Cursor $cursor, $mask = "__meta")
            {
                $this->type = $type;
                $this->cursor = $cursor;
                $this->repository = $repository;
                $this->mask = $mask;
            }

            /**
             * Retorna o próximo bean da coleção. Se chamado
             * pela primeira vez, retornará o primeiro bean
             * da coleção. Se não houver mais beans na coleção,
             * este método retornará NULL.
             *
             * @return OODBBean|NULL.
             */
            public function next()
            {
                $row = $this->cursor->getNextItem();
                if ($row)
                {
                    $beans = $this
                        ->repository
                        ->convertToBeans($this->type, array($row), $this->mask);

                    return reset($beans);
                }

                return NULL;
            }

            /**
             * Redefine a coleção desde o início, como um fresh()
             * em um bean.
             *
             * @return void.
             */
            public function reset()
            {
                $this->cursor->reset();
            }

            /**
             * Fecha o cursor subjacente (necessário para alguns bancos
             * de dados).
             *
             * @return void.
             */
            public function close()
            {
                $this->cursor->close();
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        /**
         * QueryWriter. Interface para QueryWriters.
         * Descreve a API de um QueryWriter.
         *
         * Terminologia:
         *     - propriedade embelezada (uma propriedade camelCased,
         *       deve ser convertida primeiro).
         *     - tipo embelezado (um tipo camelCased, deve ser convertido
         *       primeiro).
         *     - type (um tipo de bean, corresponde diretamente a uma
         *       tabela).
         *     - propriedade (uma propriedade do bean, corresponde
         *       diretamente a uma coluna).
         *     - tabela (um tipo verificado e entre aspas, pronto para
         *       uso em uma consulta).
         *     - coluna (uma propriedade verificada e citada, pronta
         *       para uso na consulta).
         *     - tableNoQ (igual ao tipo, mas no contexto de uma operação
         *       de banco de dados).
         *     - columnNoQ (o mesmo que propriedade, mas no contexto de
         *       uma operação de banco de dados).
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        interface QueryWriter
        {
            /**
             * Constantes de filtro SQL.
             */

            /**
             *
             */
            const C_SQLFILTER_READ = "r";

            /**
             *
             */
            const C_SQLFILTER_WRITE = "w";

            /**
             * Constantes do gravador de consultas.
             */

            /**
             *
             */
            const C_SQLSTATE_NO_SUCH_TABLE = 1;

            /**
             *
             */
            const C_SQLSTATE_NO_SUCH_COLUMN = 2;

            /**
             *
             */
            const C_SQLSTATE_INTEGRITY_CONSTRAINT_VIOLATION = 3;

            /**
             *
             */
            const C_SQLSTATE_LOCK_TIMEOUT = 4;

            /**
             * Defina regiões de tipo de dados.
             *
             * 00 - 80: tipos de dados normais.
             * 80 - 99: tipos de dados especiais, apenas digitalize/codifique
             *          se solicitado.
             * 99: especificado pelo usuário, não altere.
             */

            /**
             *
             */
            const C_DATATYPE_RANGE_SPECIAL = 80;

            /**
             *
             */
            const C_DATATYPE_RANGE_SPECIFIED = 99;

            /**
             * Defina tipos GLUE para uso com métodos glueSQLCondition.
             * Determina como prefixar um trecho de SQL antes de
             * anexá-lo a outro SQL (ou integrá-lo, caso contrário,
             * misturá-lo).
             *
             * WHERE - Cola como condição WHERE.
             * AND   - Cola como condição AND.
             */

            /**
             *
             */
            const C_GLUE_WHERE = 1;

            /**
             *
             */
            const C_GLUE_AND   = 2;

            /**
             * CTE Selecione trecho. Constantes que especificam
             * trechos selecionados para consultas CTE.
             */

            /**
             *
             */
            const C_CTE_SELECT_NORMAL = false;

            /**
             *
             */
            const C_CTE_SELECT_COUNT  = true;

            /**
             * Analisa uma string SQL para criar junções, se
             * necessário. Analisa uma string SQL para criar
             * junções, se necessário. Por exemplo com
             * $type = "book" and $sql = " @joined.author.name LIKE ? OR @joined.detail.title LIKE ? ".
             *
             * parseJoin retornará o seguinte SQL:
             * " LEFT JOIN `author` ON `author`.id = `book`.author_id
             *   LEFT JOIN `detail` ON `detail`.id = `book`.detail_id
             *   WHERE author.name LIKE ? OR detail.title LIKE ? "
             *
             * @observação esse recurso requer que o Modo Campo Estreito
             *             seja ativado (padrão).
             * @observação uma implementação padrão está disponível no
             *             AQueryWriter, a menos que um banco de dados
             *             use SQL muito diferente, isso deve ser
             *             suficiente.
             *
             * @param string $type o tipo de origem da junção.
             * @param string $sql  a string sql a ser analisada.
             * @return string.
             */
            public function parseJoin($type, $sql);

            /**
             * Grava um snippet SQL para um JOIN e retorna a
             * string do snippet SQL.
             *
             * @observação Uma implementação padrão está disponível
             * no AQueryWriter, a menos que um banco de dados use SQL
             * muito diferente, isso deve ser suficiente.
             *
             * @param string  $type          Tipo de fonte.
             * @param string  $targetType    Tipo de destino (tipo para ingressar).
             * @param string  $leftRight     Tipo de junção (possível: "LEFT", "RIGHT" ou "INNER").
             * @param string  $joinType      Relação entre tabelas unidas (
             *                               Possível: "parent", "own", "shared").
             * @param boolean $firstOfChain  É a junção de uma cadeia (ou a única junção).
             * @param string  $suffix        Sufixo a ser adicionado para tabelas de alias
             *                               (para ingressar na mesma tabela várias vezes).
             * @return string.
             */
            public function writeJoin($type, $targetType, $leftRight, $joinType, $firstOfChain, $suffix);

            /**
             * Cola um snippet SQL no início de uma cláusula
             * WHERE. Isso garante que os usuários não precisem
             * adicionar WHERE aos seus snippets de consulta.
             *
             * O snippet recebe o prefixo WHERE ou AND se começar
             * com uma condição. Se o trecho NÃO começar com uma
             * condição (ou esta função pensa assim), o trecho
             * será retornado como está.
             *
             * O tipo GLUE determina o prefixo:
             *     * NONE  - prefixos com WHERE.
             *     * WHERE - prefixa com WHERE e substitui AND se os snippets
             *               começarem com AND.
             *     * AND   - prefixos com AND.
             *
             * Este método nunca substituirá WHERE por AND, pois um
             * snippet nunca deve começar com WHERE. OU não é
             * suportado.
             *
             * Apenas um conjunto limitado de cláusulas será reconhecido
             * como não-condições. Por exemplo, iniciar um trecho com
             * instruções complexas como JOIN ou UNION não funcionará.
             * Isso é muito complexo para ser usado em um snippet.
             *
             * @observação uma implementação padrão está disponível
             *             no AQueryWriter, a menos que um banco de
             *             dados use SQL muito diferente, isso deve
             *             ser suficiente.
             *
             * @param string       $sql  Trecho SQL.
             * @param integer|NULL $glue O tipo GLUE - como glue
             *                           (C_GLUE_WHERE ou C_GLUE_AND).
             * @return string.
             */
            public function glueSQLCondition($sql, $glue = NULL);

            /**
             * Determina se existe uma cláusula LIMIT 1 no SQL.
             * Caso contrário, será adicionado um LIMIT 1. (usado
             * para findOne).
             *
             * @observação Uma implementação padrão está disponível
             * no AQueryWriter, a menos que um banco de dados use
             * SQL muito diferente, isso deve ser suficiente.
             *
             * @param string $sql Consulta para digitalizar e ajustar.
             * @return string.
             */
            public function glueLimitOne($sql);

            /**
             * Retorna as tabelas que estão no banco de dados.
             *
             * @return array.
             */
            public function getTables();

            /**
             * Este método criará uma tabela para o bean.
             * Este método aceita um tipo e infere o nome
             * da tabela correspondente.
             *
             * @param string $type Tipo de bean para o qual você deseja criar
             *                     uma tabela.
             *
             * @return void
             */
            public function createTable($type);

            /**
             * Retorna um vetor contendo todas as colunas do tipo
             * especificado. O formato do vetor de retorno é
             * semelhante a este: $field => $type onde $field
             * é o nome da coluna e $type é uma descrição
             * específica do tipo de dados do banco de dados.
             *
             * Este método aceita um tipo e infere o nome da
             * tabela correspondente.
             *
             * @param string $type tipo de bean que você deseja obter uma
             *                     lista de colunas de.
             * @return array
             */
            public function getColumns($type);

            /**
             * Retorna o código do tipo de coluna (inteiro) que corresponde
             * ao tipo de valor fornecido. Este método é usado para determinar
             * o tipo mínimo de coluna necessário para representar um
             * determinado valor. Existem dois modos de operação: com ou
             * sem tipos especiais. A varredura sem tipos especiais requer
             * que o segundo parâmetro seja definido como false. Isto é útil
             * quando a coluna já foi criada e evita que ela seja modificada
             * para um tipo incompatível, levando à perda de dados. Tipos
             * especiais serão levados em consideração quando uma coluna
             * ainda não existir (o parâmetro será então definido como
             * true).
             *
             * Tipos de colunas especiais são determinados pela constante
             * AQueryWriter C_DATA_TYPE_ONLY_IF_NOT_EXISTS (geralmente 80).
             * Outro tipo "muito especial" é o tipo C_DATA_TYPE_MANUAL
             * (geralmente 99) que representa um tipo especificado pelo
             * usuário. Embora nenhum tratamento especial tenha sido
             * associado a este último por enquanto.
             *
             * @param mixed   $value                   Valor.
             * @param boolean $alsoScanSpecialForTypes Leve em consideração tipos especiais.
             * @return integer.
             */
            public function scanType($value, $alsoScanSpecialForTypes = false);

            /**
             * Este método adicionará uma coluna a uma tabela.
             * Este método aceita um tipo e infere o nome da tabela
             * correspondente.
             *
             * @param string  $type   Nome da tabela.
             * @param string  $column Nome da coluna.
             * @param integer $field  Tipo de dados para campo.
             * @return void.
             */
            public function addColumn($type, $column, $field);

            /**
             * Retorna o código de tipo para uma descrição de
             * coluna. Dada uma descrição de coluna SQL, este
             * método retornará o código correspondente para
             * o gravador. Se o sinalizador de inclusão especial
             * estiver definido, ele também retornará códigos
             * para colunas especiais. Caso contrário, colunas
             * especiais serão identificadas como colunas
             * especificadas.
             *
             * @param string  $typedescription Descrição.
             * @param boolean $includeSpecials Se você deseja obter códigos para
             *                                 colunas especiais também.
             * @return integer.
             */
            public function code($typedescription, $includeSpecials = false);

            /**
             * Este método ampliará a coluna para o tipo de dados
             * especificado. Este método aceita um tipo e infere
             * o nome da tabela correspondente.
             *
             * @param string  $type     Tipo/tabela que precisa ser ajustada.
             * @param string  $column   Coluna que precisa ser alterada.
             * @param integer $datatype Tipo de dados de destino.
             * @return void.
             */
            public function widenColumn($type, $column, $datatype);

            /**
             * Seleciona registros do banco de dados. Este método
             * seleciona os registros do banco de dados que variam
             * ao tipo especificado, condições (opcional) e snippet
             * SQL adicional (opcional).
             *
             * @param string      $type       Nome da tabela que você deseja consultar.
             * @param array       $conditions Critério ( $column => array( $values ) )
             * @param string|NULL $addSql     Trecho SQL adicional.
             * @param array       $bindings   Ligações para trecho SQL.
             * @return array.
             */
            public function queryRecord($type, $conditions = array(), $addSql = NULL, $bindings = array());

            /**
             * Selects records from the database and returns a cursor.
             * This methods selects the records from the database that match the specified
             * type, conditions (optional) and additional SQL snippet (optional).
             *
             * @param string      $type       name of the table you want to query
             * @param array       $conditions criteria ( $column => array( $values ) )
             * @param string|NULL $addSql     additional SQL snippet
             * @param array       $bindings   bindings for SQL snippet
             *
             * @return Cursor
             */
            public function queryRecordWithCursor($type, $addSql = NULL, $bindings = array());

            /**
             * Retorna registros por meio de um tipo intermediário. Este
             * método é usado para obter registros usando uma tabela de
             * links e permite que os snippets SQL façam referência a
             * colunas na tabela de links para filtragem ou ordenação
             * adicional.
             *
             * @param string $sourceType Tipo de origem, o tipo de referência
             *                           que você deseja usar para buscar itens
             *                           relacionados no outro lado.
             * @param string $destType   Tipo de destino, o tipo de destino do
             *                           qual você deseja obter beans.
             * @param mixed  $linkID     ID a ser usado para a tabela de links.
             * @param string $addSql     Trecho SQL adicional.
             * @param array  $bindings   Vinculações para snippet SQL.
             * @return array.
             */
            public function queryRecordRelated($sourceType, $destType, $linkID, $addSql = "", $bindings = array());

            /**
             * Retorna a linha que vincula $sourceType $sourceID a
             * $destType $destID em uma relação N-M.
             *
             * @param string $sourceType Tipo de fonte, a primeira parte do
             *                           link que você está procurando.
             * @param string $destType   Tipo de destino, a segunda parte do
             *                           link que você está procurando.
             * @param string $sourceID   ID da origem.
             * @param string $destID     ID do destino.
             * @return array|null.
             */
            public function queryRecordLink($sourceType, $destType, $sourceID, $destID);

            /**
             * Conta o número de registros no banco de dados que
             * correspondem às condições e ao SQL adicional.
             *
             * @param string      $type       Nome da tabela que você deseja consultar.
             * @param array       $conditions Critério ($column => array($values)).
             * @param string|NULL $addSql     Trecho SQL adicional.
             * @param array       $bindings   Ligações para trecho SQL.
             * @return integer.
             */
            public function queryRecordCount($type, $conditions = array(), $addSql = NULL, $bindings = array());

            /**
             * Retorna o número de registros vinculados por meio de
             * $linkType e que satisfazem o SQL em $addSQL/$bindings.
             *
             * @param string $sourceType Tipo de fonte.
             * @param string $targetType A coisa que você deseja contar.
             * @param mixed  $linkID     O do tipo de origem.
             * @param string $addSQL     Trecho SQL adicional.
             * @param array  $bindings   Ligações para trecho SQL.
             * @return integer.
             */
            public function queryRecordCountRelated($sourceType, $targetType, $linkID, $addSQL = "", $bindings = array());

            /**
             * Retorna todas as linhas do tipo especificado que
             * foram marcadas com uma das strings na matriz da
             * lista de tags especificada. Observe que o snippet
             * SQL adicional só pode ser usado para paginação; o
             * snippet SQL será anexado ao final da consulta.
             *
             * @param string  $type     O tipo de bean que você deseja consultar.
             * @param array   $tagList  Um vetor de strings, cada string.
             *                          contendo um título de tag.
             * @param boolean $all      Se true retornará apenas registros que
             *                          foram associados a TODAS as tags da
             *                          lista.
             * @param string  $addSql   Adição de snippet SQL, para paginação.
             * @param array   $bindings Ligações de parâmetros para snippet SQL
             *                          adicional.
             * @return array.
             */
            public function queryTagged($type, $tagList, $all = false, $addSql = "", $bindings = array());

            /**
             * Como queryTagged, mas apenas conta.
             *
             * @param string  $type     O tipo de bean que você deseja consultar.
             * @param array   $tagList  Um vetor de strings, cada string contendo
             *                          um título de tag.
             * @param boolean $all      Se true retornará apenas registros que
             *                          foram associados a TODAS as tags da
             *                          lista.
             * @param string  $addSql   Adição de snippet SQL, para paginação.
             * @param array   $bindings Ligações de parâmetros para snippet
             *                          SQL adicional.
             * @return integer.
             */
            public function queryCountTagged($type, $tagList, $all = false, $addSql = "", $bindings = array());

            /**
             * Retorna todas as linhas pai ou filhas de uma linha
             * especificada. Dado um especificador de tipo e um ID
             * de chave primária, este método retorna todas as linhas
             * filhas conforme definido por ter <type>_id = id ou
             * todas as linhas pai conforme definido por id = <type>_id
             * levando em consideração um snippet SQL opcional junto
             * com parâmetros.
             *
             * O parâmetro $select pode ser usado para ajustar o snippet
             * de seleção da consulta. Os valores possíveis são:
             * C_CTE_SELECT_NORMAL (basta selecionar todas as
             * colunas, padrão), C_CTE_SELECT_COUNT (contar linhas)
             * usado para funções countParents e countChildren - ou
             * você mesmo pode especificar uma string como
             * "count(distinct brand)".
             *
             * @param string      $type     O tipo de bean que você deseja
             *                              consultar as linhas.
             * @param integer     $id       Id da linha de referência.
             * @param boolean     $up       true para consultar linhas pai,
             *                              false para consultar linhas filhas.
             * @param string|NULL $addSql   Snippet SQL opcional para incorporar
             *                              na consulta.
             * @param array       $bindings Ligações de parâmetros para snippet
             *                              SQL adicional.
             * @param bool        $select   Selecione Snippet a ser usado na
             *                              consulta (opcional).
             * @return array.
             */
            public function queryRecursiveCommonTableExpression($type, $id, $up = true, $addSql = NULL, $bindings = array(), $select = QueryWriter::C_CTE_SELECT_NORMAL);

            /**
             * Este método deve atualizar (ou inserir um registro),
             * leva um nome de tabela, uma lista de valores de
             * atualização ( $field => $value ) e um ID de chave
             * primária (opcional). Se nenhum ID de chave primária
             * for fornecido, ocorrerá um INSERT. Retorna o novo ID.
             * Este método aceita um tipo e infere o nome da tabela
             * correspondente.
             *
             * @param string       $type         Nome da tabela a ser atualizada.
             * @param array        $updatevalues Lista de valores de atualização.
             * @param integer|NULL $id           Valor de ID de chave primária
             *                                   opcional.
             * @return integer.
             */
            public function updateRecord($type, $updatevalues, $id = NULL);

            /**
             * Exclui registros do banco de dados.
             * @observação $addSql é sempre prefixado com " WHERE " ou " AND .".
             *
             * @param string $type       Nome da tabela que você deseja consultar.
             * @param array  $conditions Critério ($column => array($values))
             * @param string $addSql     SQL adicional.
             * @param array  $bindings   Ligações.
             * @return int
             */
            public function deleteRecord($type, $conditions = array(), $addSql = "", $bindings = array());

            /**
             * Exclui todos os links entre $sourceType e $destType
             * em uma relação N-M.
             *
             * @param string $sourceType Tipo de fonte.
             * @param string $destType   Tipo de destino.
             * @param string $sourceID   ID de origem.
             * @return void.
             */
            public function deleteRelations($sourceType, $destType, $sourceID);

            /**
             * @see QueryWriter::addUniqueConstraint.
             */
            public function addUniqueIndex($type, $columns);

            /**
             * Este método adicionará um índice de restrição UNIQUE
             * a uma tabela nas colunas $columns. Este método aceita
             * um tipo e infere o nome da tabela correspondente.
             *
             * @param string $type               Tipo de feijão alvo.
             * @param array  $columnsPartOfIndex Colunas a serem incluídas no índice.
             * @return void.
             */
            public function addUniqueConstraint($type, $columns);

            /**
             * Este método verificará se o estado SQL está na lista
             * de estados especificados e retornará true se aparecer
             * nesta lista ou false se não aparecer. O objetivo deste
             * método é traduzir o estado específico do banco de dados
             * para uma das constantes definidas nesta classe e então
             * verificar se ele está na lista de estados padrão
             * fornecida.
             *
             * @param string $state              Estado SQL a considerar.
             * @param array  $list               Lista de constantes de estado SQL
             *                                   padronizadas para verificação.
             * @param array  $extraDriverDetails Alguns bancos de dados comunicam informações
             *                                   de estado em um formato específico do driver,
             *                                   em vez de por meio do código sqlState principal.
             *                                   Para esses bancos de dados, essas informações
             *                                   extras podem ser usadas para determinar o estado
             *                                   padronizado.
             * @return boolean.
             */
            public function sqlStateIn($state, $list, $extraDriverDetails = array());

            /**
             * Este método removerá todos os beans de um determinado
             * tipo. Este método aceita um tipo e infere o nome da
             * tabela correspondente.
             *
             * @param  string $type tipo bean.
             * @return void.
             */
            public function wipe($type);

            /**
             * Este método adicionará uma chave estrangeira do tipo
             * e campo ao tipo e campo de destino. A chave estrangeira
             * é criada sem ação. Ao excluir/atualizar nenhuma ação
             * será acionada. O FK é usado apenas para permitir que
             * ferramentas de banco de dados gerem diagramas bonitos
             * e para facilitar a adição de ações posteriormente. Este
             * método aceita um tipo e infere o nome da tabela
             * correspondente.
             *
             * @param  string $type           Tipo que terá um campo de chave
             *                                estrangeira.
             * @param  string $targetType     Aponta para esse tipo.
             * @param  string $property       Campo que contém o valor da chave
             *                                estrangeira.
             * @param  string $targetProperty Campo para onde fk aponta.
             * @param  bool   $isDep          Se o destino é dependente e deve
             *                                ser transmitido em cascata na
             *                                atualização/exclusão.
             * @return void.
             */
            public function addFK($type, $targetType, $property, $targetProperty, $isDep = false);

            /**
             * Este método adicionará um índice a um tipo e campo com
             * nome $nome. Este método aceita um tipo e infere o nome
             * da tabela correspondente.
             *
             * @param string $type     Digite para adicionar o índice.
             * @param string $name     Nome do novo índice.
             * @param string $property Campo para indexar.
             * @return void.
             */
            public function addIndex($type, $name, $property);

            /**
             * Verifica e filtra um elemento da estrutura do banco
             * de dados, como uma tabela de colunas, para uso seguro
             * em uma consulta. Uma estrutura de banco de dados deve
             * estar em conformidade com a política de segurança do
             * banco de dados RedBeanPHP, o que basicamente significa
             * que apenas símbolos alfanuméricos são permitidos. Esta
             * política de segurança é mais rigorosa que as políticas
             * SQL convencionais e, portanto, não requer regras de
             * escape específicas do banco de dados.
             *
             * @param string  $databaseStructure Nome da coluna/tabela a ser verificada.
             * @param boolean $noQuotes          true para NÃO colocar crases ou aspas
             *                                   ao redor da string.
             * @return string.
             */
            public function esc($databaseStructure, $dontQuote = false);

            /**
             * Remove todas as tabelas e visualizações do banco de dados.
             *
             * @return void.
             */
            public function wipeAll();

            /**
             * Renomeia uma associação. Por exemplo, se você quiser
             * se referir a album_song como: track você pode especificar
             * isso chamando este método como:
             *
             * <code>
             *     renameAssociation("album_song", "track");
             * </code>
             *
             * Isso permite:
             *
             * <code>
             *     $album->sharedSong;
             * </code>
             *
             * Para adicionar/recuperar beans da faixa em vez de
             * album_song. Também funciona para exportAll(). Este
             * método também aceita um único array associativo como
             * primeiro argumento.
             *
             * @param string|array $fromType Nome do tipo original ou array.
             * @param string       $toType   Novo nome de tipo (somente se o
             *                               primeiro argumento for string).
             * @return void.
             */
            public function renameAssocTable($fromType, $toType = NULL);

            /**
             * Retorna o formato das tabelas de links. Dado um array
             * contendo dois nomes de tipos, este método retorna o
             * nome da tabela de links a ser usada para armazenar e
             * recuperar registros de associação. Por exemplo, dados
             * dois tipos: pessoa e projeto, a tabela de links
             * correspondente pode ser: "person_project".
             *
             * @param  array $types Dois tipos array($type1, $type2).
             * @return string.
             */
            public function getAssocTable($types);
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\QueryWriter
    {
        use RedBeanPHP\Adapter\DBAdapter as DBAdapter;
        use RedBeanPHP\RedException as RedException;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\RedException\SQL as SQLException;


        /**
         * RedBeanPHP Abstract Query Writer.
         *
         * Representa um banco de dados abstrato para RedBean.
         * Para escrever um driver para um banco de dados diferente
         * para RedBean. Contém uma série de funções que todos os
         * implementadores podem herdar ou substituir.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        abstract class AQueryWriter
        {
            /**
             * Constante: Selecione o trecho "FOR UPDATE".
             */

            /**
             *
             */
            const C_SELECT_SNIPPET_FOR_UPDATE = "FOR UPDATE";

            /**
             *
             */
            const C_DATA_TYPE_ONLY_IF_NOT_EXISTS = 80;

            /**
             *
             */
            const C_DATA_TYPE_MANUAL = 99;

            /**
             * @var array.
             */
            private static $sqlFilters = array();

            /**
             * @var boolean.
             */
            private static $flagSQLFilterSafeMode = false;

            /**
             * @var boolean.
             */
            private static $flagNarrowFieldMode = true;

            /**
             * @var boolean.
             */
            protected static $flagUseJSONColumns = false;

            /**
             * @var boolean.
             */
            protected static $enableISNULLConditions = false;

            /**
             * @var array.
             */
            public static $renames = array();

            /**
             * @var DBAdapter.
             */
            protected $adapter;

            /**
             * @var string.
             */
            protected $defaultValue = "NULL";

            /**
             * @var string.
             */
            protected $quoteCharacter = "";

            /**
             * @var boolean.
             */
            protected $flagUseCache = true;

            /**
             * @var array.
             */
            protected $cache = array();

            /**
             * @var integer.
             */
            protected $maxCacheSizePerType = 20;

            /**
             * @var string.
             */
            protected $sqlSelectSnippet = "";

            /**
             * @var array.
             */
            public $typeno_sqltype = array();

            /**
             * @var array.
             */
            public $sqltype_typeno = array();

            /**
             * @var array.
             */
            public $encoding = array();

            /**
             * @var bool.
             */
            protected static $noNuke = false;

            /**
             * Define um modelo de definição de dados para alterar as
             * instruções de criação de dados por tipo. Por exemplo,
             * para adicionar ROW_FORMAT=DYNAMIC a todas as tabelas
             * MySQL na criação:
             *
             * <code>
             *     $sql = $writer->getDDLTemplate("createTable", "*");
             *     $writer->setDDLTemplate("createTable", "*", $sql . "  ROW_FORMAT=DYNAMIC ");
             * </code>
             *
             * Para modelos específicos de propriedade, defina $beanType
             * como: account.username - então o modelo será aplicado apenas
             * a instruções SQL relacionadas a essa coluna/propriedade.
             *
             * @param string $type ( "createTable" | "widenColumn" | "addColumn" ).
             * @param string $beanType ( tipo de bean ou "*" para aplicar a todos os tipos ).
             * @param string $template Modelo SQL, contém %s para slots.
             * @return void.
             */
            public function setDDLTemplate($type, $beanType, $template)
            {
                $this->DDLTemplates[$type][$beanType] = $template;
            }

            /**
             * Returns the specified data definition template.
             * If no template can be found for the specified type, the template for
             * "*" will be returned instead.
             *
             * @param string      $type     ( "createTable" | "widenColumn" | "addColumn" )
             * @param string      $beanType ( type of bean or "*" to apply to all types )
             * @param string|NULL $property specify if you're looking for a property-specific template
             *
             * @return string
             */
            public function getDDLTemplate( $type, $beanType = "*", $property = NULL )
            {
                $key = ($property) ? "{$beanType}.{$property}" : $beanType;

                if (isset($this->DDLTemplates[$type][$key]))
                {
                    return $this->DDLTemplates[$type][$key];
                }

                if (isset( $this->DDLTemplates[$type][$beanType]))
                {
                    return $this->DDLTemplates[$type][$beanType];
                }

                return $this->DDLTemplates[$type]["*"];
            }

            /**
             * Alternativa ao suporte para condições IS-NULL. Se
             * as condições IS-NULL estiverem habilitadas, os
             * vetores de condições para funções incluindo
             * findLike() serão tratados de forma que "field" => NULL
             * será interpretado como field IS NULL em vez de
             * ser ignorado. Retorna o valor anterior do
             * sinalizador.
             *
             * @param boolean $flag true ou false.
             * @return boolean.
             */
            public static function useISNULLConditions($flag)
            {
                $old = self::$enableISNULLConditions;
                self::$enableISNULLConditions = $flag;

                return $old;
            }

            /**
             * Alterna o suporte para geração automática de colunas
             * JSON. Usar colunas JSON significa que strings contendo
             * JSON farão com que a coluna seja criada (não modificada)
             * como uma coluna JSON. No entanto, também pode desencadear
             * exceções se isso significar que o banco de dados tenta
             * converter uma coluna não json em uma coluna JSON. Retorna
             * o valor anterior do sinalizador.
             *
             * @param boolean $flag true ou false.
             * @return boolean.
             */
            public static function useJSONColumns($flag)
            {
                $old = self::$flagUseJSONColumns;
                self::$flagUseJSONColumns = $flag;

                return $old;
            }

            /**
             * Alterna o suporte para nuke(). Pode ser usado para
             * desligar o recurso nuke() por motivos de segurança.
             * Retorna o valor do sinalizador antigo.
             *
             * @param boolean $flag true ou false.
             * @return boolean.
             */
            public static function forbidNuke($flag)
            {
                $old = self::$noNuke;
                self::$noNuke = (bool) $flag;

                return $old;
            }

            /**
             * Verifica se um número pode ser tratado como um int.
             *
             * @param  string $value Representação de string de um determinado valor.
             * @return boolean.
             */
            public static function canBeTreatedAsInt($value)
            {
                return (bool) (
                    strval($value) === strval(
                        intval($value)
                    )
                );
            }

            /**
             * @see QueryWriter::getAssocTableFormat.
             */
            public static function getAssocTableFormat($types)
            {
                sort($types);
                $assoc = implode("_", $types);

                return (
                    isset(
                        self::$renames[$assoc]
                    )
                ) ? self::$renames[$assoc] : $assoc;
            }

            /**
             * @see QueryWriter::renameAssociation.
             */
            public static function renameAssociation($from, $to = NULL)
            {
                if (is_array($from))
                {
                    foreach ($from as $key => $value)
                    {
                        self::$renames[$key] = $value;
                    }

                    return;
                }

                self::$renames[$from] = $to;
            }

            /**
             * Método de serviço disponível globalmente para
             * RedBeanPHP. Converte uma corda com invólucro de
             * camelo em uma corda com invólucro de cobra.
             *
             * @param string $camel String camelCased para converter em
             *                      caixa de cobra.
             * @return string.
             */
            public static function camelsSnake($camel)
            {
                return strtolower(
                    preg_replace('/(?<=[a-z])([A-Z])|([A-Z])(?=[a-z])/', '_$1$2', $camel)
                );
            }

            /**
             * Método de serviço disponível globalmente para RedBeanPHP.
             * Converte uma corda com invólucro de cobra em uma corda
             * com invólucro de camelo.
             *
             * @param string  $snake   snake_cased string to convert to camelCase
             * @param boolean $dolphin exception for Ids - (bookId -> bookID)
             *                         too complicated for the human mind, only dolphins can understand this
             *
             * @return string
             */
            public static function snakeCamel($snake, $dolphinMode = false)
            {
                $camel = lcfirst(
                    str_replace(
                        " ",
                        "",
                        ucwords(
                            str_replace(
                                "_",
                                " ",
                                $snake
                            )
                        )
                    )
                );

                if ($dolphinMode)
                {
                    $camel = preg_replace('/(\w)Id$/', '$1ID', $camel);
                }

                return $camel;
            }

            /**
             * Limpa renomeações.
             *
             * @return void.
             */
            public static function clearRenames()
            {
                self::$renames = array();
            }

            /**
             * Alterna o "Modo de campo estreito". No modo campo
             * estreito, o método queryRecord restringirá seu
             * campo de seleção para
             *
             * SELECT {table}.*
             *
             * em vez de
             *
             * SELECT *
             *
             * Esta é uma maneira melhor de consultar porque permite
             * mais flexibilidade (por exemplo, junções). No entanto,
             * se você precisar de um seletor amplo para compatibilidade
             * com versões anteriores; use este método para desligar o
             * modo de campo estreito passando false. O padrão é true.
             *
             * @param boolean $narrowField true = Narrow Field false = Wide Field.
             * @return void.
             */
            public static function setNarrowFieldMode($narrowField)
            {
                self::$flagNarrowFieldMode = (boolean) $narrowField;
            }

            /**
             * Define filtros SQL. Este é um método de baixo
             * nível para definir o vetor de filtros SQL. O
             * formato desse vetor é:
             *
             * <code>
             *     array(
             *         "<MODE, i.e. "r" for read, "w" for write>" => array(
             *             "<TABLE NAME>" => array(
             *                 "<COLUMN NAME>" => "<SQL>"
             *             )
             *         )
             *     )
             * </code>
             *
             * Exemplo:
             *
             * <code>
             *     array(
             *         QueryWriter::C_SQLFILTER_READ => array(
             *             "book" => array(
             *                 "title" => " LOWER(book.title) "
             *             )
             *         )
             *     )
             * </code>
             *
             * Observe que você pode usar constantes em vez de caracteres
             * mágicos como chaves para o array superior. Este é um método
             * de baixo nível. Para um método mais amigável, dê uma olhada
             * na facade: R::bindFunc().
             *
             * @param array lista de filtros para definir.
             * @return void
             */
            public static function setSQLFilters($sqlFilters, $safeMode = false)
            {
                self::$flagSQLFilterSafeMode = (boolean) $safeMode;
                self::$sqlFilters = $sqlFilters;
            }

            /**
             * Retorna os filtros SQL atuais. Este método retorna
             * o vetor de filtro SQL bruto. Este é um método de
             * baixo nível. Para um método mais amigável, dê uma
             * olhada na facade: R::bindFunc().
             *
             * @return array.
             */
            public static function getSQLFilters()
            {
                return self::$sqlFilters;
            }

            /**
             * Retorna uma chave de cache para os valores de cache
             * passados. Este método retorna uma string de impressão
             * digital para ser usada como chave para armazenar dados
             * no cache do gravador.
             *
             * @param array $keyValues key-value para gerar chave para.
             * @return string
             */
            private function getCacheKey($keyValues)
            {
                return json_encode($keyValues);
            }

            /**
             * Retorna os valores associados à chave e tag de cache
             * fornecidas.
             *
             * @param string $cacheTag Tag de cache a ser usada para pesquisa.
             * @param string $key      Chave a ser usada para pesquisa.
             * @return mixed.
             */
            private function getCached($cacheTag, $key)
            {
                $sql = $this->adapter->getSQL();

                if ($this->updateCache())
                {
                    if (isset($this->cache[$cacheTag][$key]))
                    {
                        return $this->cache[$cacheTag][$key];
                    }
                }

                return NULL;
            }

            /**
             * Verifica se a consulta anterior tinha uma tag keep-cache.
             * Nesse caso, o cache persistirá, caso contrário, o cache
             * será liberado. Retorna true se o cache permanecerá e
             * false se uma limpeza tiver sido realizada.
             *
             * @return boolean
             */
            private function updateCache()
            {
                $sql = $this->adapter->getSQL();

                if (strpos($sql, "-- keep-cache") !== strlen($sql) - 13)
                {
                    /**
                     * Se o SQL ocorreu fora deste método, então algo
                     * mais, então uma consulta de seleção pode ter
                     * acontecido. (ou instrua para manter o cache).
                     */
                    $this->cache = array();

                    return false;
                }

                return true;
            }

            /**
             * Armazena dados do gravador no cache sob uma chave e
             * tag de cache específicas. Uma tag de cache é usada
             * para garantir que o cache permaneça consistente. Na
             * maioria dos casos, a tag de cache será do tipo bean,
             * isso garante que as consultas associadas a um
             * determinado tipo de referência nunca contenham dados
             * conflitantes. Por que não usar a tag de cache como
             * chave ? Bem, precisamos ter certeza de que o conteúdo
             * do cache se ajusta à chave (e a chave é baseada nos
             * valores do cache). Caso contrário, seria possível
             * armazenar dois conjuntos de resultados diferentes
             * na mesma chave (a tag de cache).
             *
             * Nas versões anteriores você só podia armazenar uma
             * entrada de chave. Alterei isso para melhorar a
             * eficiência do cache (problema nº 400).
             *
             * @param string    $cacheTag Tag de cache (chave secundária).
             * @param string    $key      Chave para armazenar valores.
             * @param array|int $values   Linhas ou contador a serem armazenadas.
             * @return void.
             */
            private function putResultInCache($cacheTag, $key, $values)
            {
                if (isset($this->cache[$cacheTag]))
                {
                    if (count( $this->cache[$cacheTag]) > $this->maxCacheSizePerType)
                    {
                        array_shift($this->cache[$cacheTag]);
                    }
                } else
                {
                    $this->cache[$cacheTag] = array();
                }

                $this->cache[$cacheTag][$key] = $values;
            }

            /**
             * Cria um snippet SQL a partir de uma lista de
             * condições de formato:
             *
             * <code>
             *     array(
             *         key => array(
             *             value1,
             *             value2,
             *             value3 ....
             *         )
             *     )
             * </code>
             *
             * @param array  $conditions Lista de condições.
             * @param array  $bindings   Ligações de parâmetros para snippet SQL.
             * @param string $addSql     Snippet SQL adicional para anexar ao resultado.
             * @return string.
             */
            private function makeSQLFromConditions($conditions, &$bindings, $addSql = "")
            {
                reset($bindings);

                $firstKey = key($bindings);
                $paramTypeIsNum = (is_numeric($firstKey));
                $counter = 0;

                $sqlConditions = array();
                foreach ( $conditions as $column => $values )
                {
                    if ($values === NULL)
                    {
                        if (self::$enableISNULLConditions)
                        {
                            $sqlConditions[] = $this->esc( $column ) . " IS NULL";
                        }

                        continue;
                    }

                    if (is_array($values))
                    {
                        if (empty($values))
                        {
                            continue;
                        }
                    } else
                    {
                        $values = array($values);
                    }

                    $checkOODB = reset($values);
                    if ($checkOODB instanceof OODBBean && $checkOODB->getMeta("type") === $column && substr($column, -3) != "_id")
                    {
                        $column = $column . "_id";
                    }

                    $sql = $this->esc( $column );
                    $sql .= " IN ( ";

                    if ($paramTypeIsNum)
                    {
                        $sql .= implode(
                            ",",
                            array_fill(
                                0,
                                count(
                                    $values
                                ),
                                "?"
                            )
                        ) . " ) ";

                        array_unshift($sqlConditions, $sql);
                        foreach ($values as $k => $v)
                        {
                            if ($v instanceof OODBBean)
                            {
                                $v = $v->id;
                            }

                            $values[$k] = strval($v);
                            array_unshift($bindings, $v);
                        }
                    } else
                    {
                        $slots = array();

                        foreach($values as $k => $v)
                        {
                            if ($v instanceof OODBBean)
                            {
                                $v = $v->id;
                            }

                            $slot = ":slot".$counter++;
                            $slots[] = $slot;
                            $bindings[$slot] = strval( $v );
                        }

                        $sql .= implode(",", $slots)." ) ";
                        $sqlConditions[] = $sql;
                    }
                }

                $sql = "";
                if (!empty($sqlConditions))
                {
                    $sql .= " WHERE ( " . implode(" AND ", $sqlConditions) . ") ";
                }

                $addSql = $this->glueSQLCondition(
                    $addSql,
                    !empty(
                        $sqlConditions
                    ) ? QueryWriter::C_GLUE_AND : NULL
                );

                if ($addSql)
                {
                    $sql .= $addSql;
                }

                return $sql;
            }

            /**
             * Retorna os nomes das tabelas e dos nomes das colunas
             * para uma consulta relacional.
             *
             * @param string  $sourceType Tipo do bean de origem.
             * @param string  $destType   Tipo de bean que você deseja obter
             *                            usando a relação
             * @param boolean $noQuote    true se você quiser omitir aspas.
             * @return array
             */
            private function getRelationalTablesAndColumns($sourceType, $destType, $noQuote = false)
            {
                $linkTable = $this->esc($this->getAssocTable(array($sourceType, $destType)), $noQuote);
                $sourceCol = $this->esc($sourceType . "_id", $noQuote);

                /**
                 *
                 */
                if ($sourceType === $destType)
                {
                    $destCol = $this->esc($destType . "2_id", $noQuote);
                } else
                {
                    $destCol = $this->esc($destType . "_id", $noQuote);
                }

                /**
                 *
                 */
                $sourceTable = $this->esc($sourceType, $noQuote);
                $destTable   = $this->esc($destType, $noQuote);

                /**
                 *
                 */
                return array(
                    $sourceTable,
                    $destTable,
                    $linkTable,
                    $sourceCol,
                    $destCol
                );
            }

            /**
             * Determina se uma string pode ser considerada JSON
             * ou não. Isso é usado por escritores que oferecem
             * suporte a colunas JSON. No entanto, não queremos
             * que esse código seja duplicado em todos os JSON
             * que suportam Query Writers.
             *
             * @param string $value valor para determinar "JSONness" de.
             * @return boolean.
             */
            protected function isJSON($value)
            {
                return (
                    is_string($value) &&
                    is_array(json_decode($value, true)) &&
                    (json_last_error() == JSON_ERROR_NONE)
                );
            }

            /**
             * Dado um tipo e um nome de propriedade, este método
             * retorna a seção do mapa de chave estrangeira associada
             * a este par.
             *
             * @param string $type     Nome do tipo.
             * @param string $property Nome da propriedade.
             *
             * @return array|NULL
             */
            protected function getForeignKeyForTypeProperty($type, $property)
            {
                $property = $this->esc($property, true);

                try
                {
                    $map = $this->getKeyMapForType($type);
                } catch (SQLException $e)
                {
                    return NULL;
                }

                foreach($map as $key)
                {
                    if ($key["from"] === $property)
                    {
                        return $key;
                    }
                }

                return NULL;
            }

            /**
             * Retorna o mapa de chave estrangeira (FKM) para um
             * tipo. Um mapa de chave estrangeira descreve as
             * chaves estrangeiras em uma tabela. Um FKM
             * sempre tem a mesma estrutura:
             *
             * <code>
             *     array(
             *         "name" => <name of the foreign key>
             *         "from" => <name of the column on the source table>
             *         "table" => <name of the target table>
             *         "to" => <name of the target column> (most of the time "id")
             *         "on_update" => <update rule: "SET NULL","CASCADE" or "RESTRICT">
             *         "on_delete" => <delete rule: "SET NULL","CASCADE" or "RESTRICT">
             *     )
             * </code>
             *
             * @observação: as chaves no vetor de resultados são FKDLs,
             * ou seja, chaves exclusivas descritivas por tabela de
             * origem. Veja também: AQueryWriter::makeFKLabel para
             * obter detalhes.
             *
             * @param string $type O tipo de bean do qual você deseja
             *                     obter um mapa-chave.
             * @return array.
             */
            protected function getKeyMapForType($type)
            {
                return array();
            }

            /**
             * Este método cria uma chave para um array de descrição
             * de chave estrangeira. Esta chave é uma string legível
             * exclusiva para cada tabela de origem. Essa chave
             * uniforme é chamada de rótulo de descrição de chave
             * estrangeira FKDL. Observe que a tabela de origem não
             * faz parte do FKDL porque essa chave deve ser
             * "por tabela de origem". Se você deseja incluir uma
             * tabela de origem, prefixe a chave com "on_table_<SOURCE>_".
             *
             * @param string $from  A coluna da chave na tabela de origem.
             * @param string $type  O tipo (tabela) para onde a chave aponta.
             * @param string $to    A coluna de destino da chave estrangeira
             *                      (principalmente apenas "id").
             * @return string.
             */
            protected function makeFKLabel($from, $type, $to)
            {
                return "from_{$from}_to_table_{$type}_col_{$to}";
            }

            /**
             * Retorna um trecho de filtro SQL para leitura.
             *
             * @param string $type tipo de bean.
             * @return string.
             */
            protected function getSQLFilterSnippet($type)
            {
                $existingCols = array();
                if (self::$flagSQLFilterSafeMode)
                {
                    $existingCols = $this->getColumns($type);
                }

                $sqlFilters = array();
                if (isset(self::$sqlFilters[QueryWriter::C_SQLFILTER_READ][$type]))
                {
                    foreach(self::$sqlFilters[QueryWriter::C_SQLFILTER_READ][$type] as $property => $sqlFilter)
                    {
                        if (!self::$flagSQLFilterSafeMode || isset($existingCols[$property]))
                        {
                            $sqlFilters[] = $sqlFilter." AS ".$property." ";
                        }
                    }
                }

                /**
                 *
                 */
                $sqlFilterStr = (
                    count($sqlFilters)
                ) ? ("," . implode(",", $sqlFilters)) : "";

                /**
                 *
                 */
                return $sqlFilterStr;
            }

            /**
             * Generates a list of parameters (slots) for an SQL snippet.
             * This method calculates the correct number of slots to insert in the
             * SQL snippet and determines the correct type of slot. If the bindings
             * array contains named parameters this method will return named ones and
             * update the keys in the value list accordingly (that's why we use the &).
             *
             * If you pass an offset the bindings will be re-added to the value list.
             * Some databases cant handle duplicate parameter names in queries.
             *
             * @param array   &$valueList    list of values to generate slots for (gets modified if needed)
             * @param array   $otherBindings list of additional bindings
             * @param integer $offset        start counter at...
             *
             * @return string
             */
            protected function getParametersForInClause(&$valueList, $otherBindings, $offset = 0)
            {
                if (is_array($otherBindings) && count($otherBindings) > 0)
                {
                    reset($otherBindings);

                    /**
                     *
                     */
                    $key = key($otherBindings);

                    /**
                     *
                     */
                    if (!is_numeric($key))
                    {
                        $filler  = array();
                        $newList = (!$offset) ? array() : $valueList;
                        $counter = $offset;

                        foreach($valueList as $value)
                        {
                            $slot = ":slot" . ($counter++);
                            $filler[] = $slot;
                            $newList[$slot] = $value;
                        }

                        /**
                         * Mude as chaves!
                         */
                        $valueList = $newList;

                        /**
                         *
                         */
                        return implode(",", $filler);
                    }
                }

                /**
                 *
                 */
                return implode(
                    ",",
                    array_fill(
                        0,
                        count(
                            $valueList
                        ),

                        "?"
                    )
                );
            }

            /**
             * Adiciona um tipo de dados à lista de tipos de
             * dados. Use este método para adicionar uma nova
             * definição de tipo de coluna ao gravador. Usado
             * para suporte UUID.
             *
             * @param integer $dataTypeID    Constante de número mágico atribuído
             *                               a este tipo de dados.
             * @param string  $SQLDefinition Definição de coluna SQL (por exemplo, INT(11)).
             * @return self.
             */
            protected function addDataType($dataTypeID, $SQLDefinition)
            {
                $this->typeno_sqltype[$dataTypeID] = $SQLDefinition;
                $this->sqltype_typeno[$SQLDefinition] = $dataTypeID;

                return $this;
            }

            /**
             * Retorna o sql que deve seguir uma instrução insert.
             *
             * @param string $table name.
             * @return string.
             */
            protected function getInsertSuffix($table)
            {
                return "";
            }

            /**
             * Verifica se um valor começa com zeros. Neste
             * caso, o valor provavelmente deveria ser armazenado
             * usando um tipo de dados de texto em vez de um
             * tipo numérico para preservar os zeros.
             *
             * @param string $value valor a ser verificado.
             * @return boolean.
             */
            protected function startsWithZeros($value)
            {
                $value = strval($value);

                if (strlen($value) > 1 && strpos($value, "0") === 0 && strpos($value, "0.") !== 0)
                {
                    return true;
                } else
                {
                    return false;
                }
            }

            /**
             * Insere um registro no banco de dados usando uma série
             * de colunas de inserção e valores de inserção correspondentes.
             * Retorna o ID de inserção.
             *
             * @param string $table         Tabela para realizar a consulta.
             * @param array  $insertcolumns Colunas a serem inseridas.
             * @param array  $insertvalues  Valores a serem inseridos.
             * @return integer.
             */
            protected function insertRecord($type, $insertcolumns, $insertvalues)
            {
                $default = $this->defaultValue;
                $suffix = $this->getInsertSuffix($type);
                $table = $this->esc($type);

                if (count($insertvalues) > 0 && is_array($insertvalues[0]) && count($insertvalues[0]) > 0)
                {
                    $insertSlots = array();
                    foreach ($insertcolumns as $k => $v)
                    {
                        $insertcolumns[$k] = $this->esc($v);

                        if (isset(self::$sqlFilters["w"][$type][$v]))
                        {
                            $insertSlots[] = self::$sqlFilters["w"][$type][$v];
                        } else
                        {
                            $insertSlots[] = "?";
                        }
                    }

                    $insertSQL = "INSERT INTO $table ( id, " . implode( ",", $insertcolumns ) . " ) VALUES
                        ( $default, " . implode( ",", $insertSlots ) . " ) $suffix";

                    $ids = array();
                    foreach ($insertvalues as $i => $insertvalue)
                    {
                        $ids[] = $this->adapter->getCell(
                            $insertSQL,
                            $insertvalue,
                            $i
                        );
                    }

                    $result = count($ids) === 1 ? array_pop($ids) : $ids;
                } else
                {
                    $result = $this->adapter->getCell(
                        "INSERT INTO $table (id) VALUES($default) $suffix"
                    );
                }

                if ($suffix)
                {
                    return $result;
                }

                /**
                 *
                 */
                $last_id = $this->adapter->getInsertID();

                /**
                 *
                 */
                return $last_id;
            }

            /**
             * Verifica o nome da tabela ou o nome da coluna.
             *
             * @param string $table cadeia de caracteres da tabela.
             * @return string.
             */
            protected function check($struct)
            {
                if (!is_string($struct) || !preg_match('/^[a-zA-Z0-9_]+$/', $struct))
                {
                    throw new RedException(
                        "Identifier does not conform to RedBeanPHP security policies."
                    );
                }

                return $struct;
            }

            /**
             * Verifique se o tipo especificado (ou seja, tabela)
             * já existe no banco de dados. Não faz parte da
             * interface do banco de dados de objetos !
             *
             * @param string $table table nome.
             * @return boolean.
             */
            public function tableExists($table)
            {
                $tables = $this->getTables();

                return in_array(
                    $table,
                    $tables
                );
            }

            /**
             * @see QueryWriter::glueSQLCondition.
             */
            public function glueSQLCondition($sql, $glue = NULL)
            {
                static $snippetCache = array();

                if (is_null($sql))
                {
                    return "";
                }

                if (trim($sql) === "")
                {
                    return $sql;
                }

                $key = $glue . "|" . $sql;
                if (isset($snippetCache[$key]))
                {
                    return $snippetCache[$key];
                }

                $lsql = ltrim($sql);
                if (preg_match('/^(INNER|LEFT|RIGHT|JOIN|AND|OR|WHERE|ORDER|GROUP|HAVING|LIMIT|OFFSET)\s+/i', $lsql))
                {
                    if ($glue === QueryWriter::C_GLUE_WHERE && stripos($lsql, "AND") === 0)
                    {
                        $snippetCache[$key] = " WHERE " . substr($lsql, 3);
                    } else
                    {
                        $snippetCache[$key] = $sql;
                    }
                } else
                {
                    $snippetCache[$key] = (
                        (
                            $glue === QueryWriter::C_GLUE_AND
                        ) ? " AND " : " WHERE "
                    ) . $sql;
                }

                /**
                 *
                 */
                return $snippetCache[$key];
            }

            /**
             * @see QueryWriter::glueLimitOne.
             */
            public function glueLimitOne($sql = "")
            {
                return (
                    strpos(
                        strtoupper(
                            " " . $sql
                        ),

                        " LIMIT "
                    ) === false
                ) ? ($sql . " LIMIT 1 ") : $sql;
            }

            /**
             * @see QueryWriter::esc.
             */
            public function esc($dbStructure, $dontQuote = false)
            {
                $this->check($dbStructure);

                return (
                    $dontQuote
                ) ? $dbStructure : $this->quoteCharacter . $dbStructure . $this->quoteCharacter;
            }

            /**
             * @see QueryWriter::addColumn.
             */
            public function addColumn($beanType, $column, $field)
            {
                $table = $beanType;
                $type = $field;
                $table = $this->esc($table);
                $column = $this->esc($column);

                /**
                 *
                 */
                $type = (
                    isset(
                        $this->typeno_sqltype[$type]
                    )
                ) ? $this->typeno_sqltype[$type] : "";

                /**
                 *
                 */
                $this->adapter->exec(
                    sprintf(
                        $this->getDDLTemplate("addColumn", $beanType, $column),
                        $table,
                        $column,
                        $type
                    )
                );
            }

            /**
             * @see QueryWriter::updateRecord.
             */
            public function updateRecord($type, $updatevalues, $id = NULL)
            {
                $table = $type;

                if (!$id)
                {
                    $insertcolumns = $insertvalues = array();
                    foreach ($updatevalues as $pair)
                    {
                        $insertcolumns[] = $pair["property"];
                        $insertvalues[] = $pair["value"];
                    }

                    /**
                     * Caso contrário, o psql retorna string enquanto o
                     * MySQL/SQLite retorna numérico, causando problemas
                     * com adições (array_diff).
                     */
                    return (string) $this->insertRecord(
                        $table,
                        $insertcolumns,
                        array(
                            $insertvalues
                        )
                    );
                }

                if ($id && !count($updatevalues))
                {
                    return $id;
                }

                $table = $this->esc($table);
                $sql = "UPDATE $table SET ";
                $p = $v = array();

                foreach ($updatevalues as $uv)
                {
                    if (isset(self::$sqlFilters["w"][$type][$uv["property"]]))
                    {
                        $p[] = " {$this->esc( $uv["property"] )} = ". self::$sqlFilters["w"][
                            $type
                        ][$uv["property"]];
                    } else
                    {
                        $p[] = " {$this->esc( $uv["property"] )} = ? ";
                    }

                    $v[] = $uv["value"];
                }

                /**
                 *
                 */
                $sql .= implode(",", $p) . " WHERE id = ? ";
                $v[] = $id;

                /**
                 *
                 */
                $this->adapter->exec($sql, $v);

                /**
                 *
                 */
                return $id;
            }

            /**
             * @see QueryWriter::parseJoin.
             */
            public function parseJoin($type, $sql, $cteType = NULL)
            {
                if (strpos($sql, "@") === false)
                {
                    return $sql;
                }

                $sql = " " . $sql;
                $joins = array();
                $joinSql = "";

                if (!preg_match_all('#@((shared|own|joined)\.[^\s(,=!?]+)#', $sql, $matches))
                {
                    return $sql;
                }

                /**
                 *
                 */
                $expressions = $matches[1];

                /**
                 * Classifique para fazer as junções da mais longa para
                 * a mais curta.
                 */
                uasort($expressions, function($a, $b)
                {
                    return substr_count($b, ".") - substr_count($a, ".");
                });

                $nsuffix = 1;
                foreach ($expressions as $exp)
                {
                    $explosion = explode(".", $exp);
                    $joinTable = $type;
                    $joinType = array_shift($explosion);
                    $lastPart = array_pop($explosion);
                    $lastJoin = end($explosion);

                    if (($index = strpos($lastJoin, "[")) !== false)
                    {
                        $lastJoin = substr($lastJoin, 0, $index);
                    }

                    /**
                     *
                     */
                    reset($explosion);

                    /**
                     * Vamos verificar se já aderimos a essa cadeia.
                     * Se for esse o caso, pulamos isso.
                     */
                    $joinKey  = implode(".", $explosion);
                    foreach ($joins as $chain => $suffix)
                    {
                        if (strpos($chain, $joinKey) === 0)
                        {
                            $sql = str_replace("@{$exp}", "{$lastJoin}__rb{$suffix}.{$lastPart}", $sql);
                            continue 2;
                        }
                    }

                    $sql = str_replace( "@{$exp}", "{$lastJoin}__rb{$nsuffix}.{$lastPart}", $sql );
                    $joins[$joinKey] = $nsuffix;

                    /**
                     * Fazemos um loop nos elementos da junção.
                     */
                    $i = 0;
                    while (true)
                    {
                        $joinInfo = $explosion[$i];
                        if ($i)
                        {
                            $joinType = $explosion[$i - 1];
                            $joinTable = $explosion[$i - 2];
                        }

                        $aliases = array();
                        if (($index = strpos($joinInfo, "[")) !== false)
                        {
                            if (preg_match_all('#(([^\s:/\][]+)[/\]])#', $joinInfo, $matches))
                            {
                                $aliases = $matches[2];
                                $joinInfo = substr($joinInfo, 0, $index);
                            }
                        }

                        if (($index = strpos($joinTable, "[")) !== false)
                        {
                            $joinTable = substr($joinTable, 0, $index);
                        }

                        if ($i)
                        {
                            $joinSql .= $this->writeJoin(
                                $joinTable,
                                $joinInfo, "INNER",
                                $joinType, false, "__rb{$nsuffix}",
                                $aliases, NULL
                            );
                        } else
                        {
                            $joinSql .= $this->writeJoin(
                                $joinTable,
                                $joinInfo, "LEFT",
                                $joinType, true, "__rb{$nsuffix}",
                                $aliases,
                                $cteType
                            );
                        }

                        $i += 2;
                        if (!isset($explosion[$i]))
                        {
                            break;
                        }
                    }

                    $nsuffix++;
                }

                $sql = str_ireplace(" where ", " WHERE ", $sql);
                if (strpos($sql, " WHERE ") === false)
                {
                    if (preg_match('/^(ORDER|GROUP|HAVING|LIMIT|OFFSET)\s+/i', trim($sql)))
                    {
                        $sql = "{$joinSql} {$sql}";
                    } else
                    {
                        $sql = "{$joinSql} WHERE {$sql}";
                    }
                } else
                {
                    $sqlParts = explode(" WHERE ", $sql, 2);
                    $sql = "{$sqlParts[0]} {$joinSql} WHERE {$sqlParts[1]}";
                }

                return $sql;
            }

            /**
             * @see QueryWriter::writeJoin.
             */
            public function writeJoin($type, $targetType, $leftRight = "LEFT", $joinType = "parent", $firstOfChain = true, $suffix = "", $aliases = array(), $cteType = NULL)
            {
                if ($leftRight !== "LEFT" && $leftRight !== "RIGHT" && $leftRight !== "INNER")
                {
                    throw new RedException("Invalid JOIN.");
                }

                $globalAliases = OODBBean::getAliases();
                if (isset($globalAliases[$targetType]))
                {
                    $destType = $globalAliases[$targetType];
                    $asTargetTable = $this->esc($targetType.$suffix);
                } else
                {
                    $destType = $targetType;
                    $asTargetTable = $this->esc($destType.$suffix);
                }

                if ($firstOfChain)
                {
                    $table = $this->esc($type);
                } else
                {
                    $table = $this->esc($type.$suffix);
                }

                /**
                 *
                 */
                $targetTable = $this->esc($destType);

                /**
                 *
                 */
                if ($joinType == "shared")
                {
                    if (isset($globalAliases[$type]))
                    {
                        $field = $this->esc($globalAliases[$type], true);
                        if ($aliases && count($aliases) === 1)
                        {
                            $assocTable = reset($aliases);
                        } else
                        {
                            $assocTable = $this->getAssocTable(
                                array(
                                    $cteType ? $cteType : $globalAliases[$type],
                                    $destType
                                )
                            );
                        }
                    } else
                    {
                        $field = $this->esc($type, true);
                        if ($aliases && count($aliases) === 1)
                        {
                            $assocTable = reset($aliases);
                        } else
                        {
                            $assocTable = $this->getAssocTable(
                                array(
                                    $cteType ? $cteType : $type,
                                    $destType
                                )
                            );
                        }
                    }

                    $linkTable = $this->esc($assocTable);
                    $asLinkTable = $this->esc($assocTable.$suffix);
                    $leftField = "id";
                    $rightField = $cteType ? "{$cteType}_id" : "{$field}_id";
                    $linkField = $this->esc($destType, true);
                    $linkLeftField = "id";
                    $linkRightField = "{$linkField}_id";
                    $joinSql = " {$leftRight} JOIN {$linkTable}";

                    if (isset($globalAliases[$targetType]) || $suffix)
                    {
                        $joinSql .= " AS {$asLinkTable}";
                    }

                    /**
                     *
                     */
                    $joinSql .= " ON {$table}.{$leftField} = {$asLinkTable}.{$rightField}";
                    $joinSql .= " {$leftRight} JOIN {$targetTable}";

                    /**
                     *
                     */
                    if (isset($globalAliases[$targetType]) || $suffix)
                    {
                        $joinSql .= " AS {$asTargetTable}";
                    }

                    /**
                     *
                     */
                    $joinSql .= " ON {$asTargetTable}.{$linkLeftField} = {$asLinkTable}.{$linkRightField}";
                } elseif ($joinType == "own")
                {
                    $field = $this->esc($type, true);
                    $rightField = "id";
                    $joinSql = " {$leftRight} JOIN {$targetTable}";

                    if (isset($globalAliases[$targetType]) || $suffix)
                    {
                        $joinSql .= " AS {$asTargetTable}";
                    }

                    if ($aliases)
                    {
                        $conditions = array();
                        foreach ($aliases as $alias)
                        {
                            $conditions[] = "{$asTargetTable}.{$alias}_id = {$table}.{$rightField}";
                        }

                        $joinSql .= " ON ( " . implode( " OR ", $conditions ) . " ) ";
                    } else
                    {
                        $leftField = $cteType ? "{$cteType}_id" : "{$field}_id";
                        $joinSql .= " ON {$asTargetTable}.{$leftField} = {$table}.{$rightField} ";
                    }
                } else
                {
                    $field = $this->esc($targetType, true);
                    $leftField  = "id";

                    $joinSql = " {$leftRight} JOIN {$targetTable}";
                    if (isset($globalAliases[$targetType]) || $suffix)
                    {
                        $joinSql .= " AS {$asTargetTable}";
                    }

                    if ($aliases)
                    {
                        $conditions = array();
                        foreach ($aliases as $alias)
                        {
                            $conditions[] = "{$asTargetTable}.{$leftField} = {$table}.{$alias}_id";
                        }

                        $joinSql .= " ON ( " . implode( " OR ", $conditions ) . " ) ";
                    } else
                    {
                        $rightField = "{$field}_id";
                        $joinSql .= " ON {$asTargetTable}.{$leftField} = {$table}.{$rightField} ";
                    }
                }

                return $joinSql;
            }

            /**
             * Define um snippet SQL a ser usado na próxima operação
             * queryRecord(). Um trecho de seleção será inserido no
             * final da instrução SQL select e pode ser usado para
             * modificar comandos SQL-select para ativar o bloqueio,
             * por exemplo, usando o trecho "FOR UPDATE" (isso irá
             * gerar uma consulta SQL como: "SELECT * FROM ... FOR UPDATE".
             * Depois que a consulta for executada, o snippet SQL
             * será apagado. Observe que apenas a primeira invocação
             * direta ou indireta de queryRecord() por meio de batch(),
             * find() ou load() será afetada. O snippet SQL será
             * armazenado em cache.
             *
             * @param string $sql Snippet SQL para usar na instrução SELECT.
             * return self.
             */
            public function setSQLSelectSnippet($sqlSelectSnippet = "")
            {
                $this->sqlSelectSnippet = $sqlSelectSnippet;
                return $this;
            }

            /**
             * @see QueryWriter::queryRecord.
             */
            public function queryRecord($type, $conditions = array(), $addSql = NULL, $bindings = array())
            {
                if ($this->flagUseCache && $this->sqlSelectSnippet != self::C_SELECT_SNIPPET_FOR_UPDATE)
                {
                    $key = $this->getCacheKey(
                        array(
                            $conditions,
                            trim("$addSql {$this->sqlSelectSnippet}"),
                            $bindings,
                            "select"
                        )
                    );

                    if ($cached = $this->getCached($type, $key))
                    {
                        return $cached;
                    }
                }

                /**
                 *
                 */
                $table = $this->esc($type);
                $sqlFilterStr = "";

                /**
                 *
                 */
                if (count(self::$sqlFilters))
                {
                    $sqlFilterStr = $this->getSQLFilterSnippet($type);
                }

                if (is_array($conditions) && !empty ($conditions))
                {
                    $sql = $this->makeSQLFromConditions(
                        $conditions,
                        $bindings,
                        $addSql
                    );
                } else
                {
                    $sql = $this->glueSQLCondition($addSql);
                }

                $sql = $this->parseJoin( $type, $sql );
                $fieldSelection = self::$flagNarrowFieldMode ? "{$table}.*" : "*";
                $sql = "SELECT {$fieldSelection} {$sqlFilterStr} FROM {$table} {$sql} {$this->sqlSelectSnippet} -- keep-cache";

                $this->sqlSelectSnippet = "";
                $rows  = $this->adapter->get($sql, $bindings);

                if ($this->flagUseCache && !empty($key))
                {
                    $this->putResultInCache(
                        $type,
                        $key,
                        $rows
                    );
                }

                return $rows;
            }

            /**
             * @see QueryWriter::queryRecordWithCursor.
             */
            public function queryRecordWithCursor($type, $addSql = NULL, $bindings = array())
            {
                $table = $this->esc($type);
                $sqlFilterStr = "";

                /**
                 *
                 */
                if (count(self::$sqlFilters))
                {
                    $sqlFilterStr = $this->getSQLFilterSnippet($type);
                }

                /**
                 *
                 */
                $sql = $this->glueSQLCondition($addSql, NULL);
                $sql = $this->parseJoin($type, $sql);
                $fieldSelection = self::$flagNarrowFieldMode ? "{$table}.*" : "*";
                $sql = "SELECT {$fieldSelection} {$sqlFilterStr} FROM {$table} {$sql} -- keep-cache";

                /**
                 *
                 */
                return $this->adapter->getCursor(
                    $sql,
                    $bindings
                );
            }

            /**
             * @see QueryWriter::queryRecordRelated.
             */
            public function queryRecordRelated($sourceType, $destType, $linkIDs, $addSql = "", $bindings = array())
            {
                list(
                    $sourceTable,
                    $destTable,
                    $linkTable,
                    $sourceCol,
                    $destCol
                ) = $this->getRelationalTablesAndColumns($sourceType, $destType);

                if ($this->flagUseCache)
                {
                    $key = $this->getCacheKey(
                        array(
                            $sourceType,
                            implode(
                                ",",
                                $linkIDs
                            ),

                            trim($addSql),
                            $bindings,
                            "selectrelated"
                        )
                    );

                    if ($cached = $this->getCached($destType, $key))
                    {
                        return $cached;
                    }
                }

                $addSql = $this->glueSQLCondition($addSql, QueryWriter::C_GLUE_WHERE);
                $inClause = $this->getParametersForInClause($linkIDs, $bindings);
                $sqlFilterStr = "";

                if (count(self::$sqlFilters))
                {
                    $sqlFilterStr = $this->getSQLFilterSnippet(
                        $destType
                    );
                }

                if ($sourceType === $destType)
                {
                    /**
                     * Para alguns bancos de dados.
                     */
                    $inClause2 = $this->getParametersForInClause(
                        $linkIDs,
                        $bindings,
                        count(
                            $bindings
                        )
                    );

                    $sql = "
                        SELECT
                            {$destTable}.* {$sqlFilterStr} ,
                            COALESCE(
                            NULLIF({$linkTable}.{$sourceCol}, {$destTable}.id),
                            NULLIF({$linkTable}.{$destCol}, {$destTable}.id)) AS linked_by
                        FROM {$linkTable}
                        INNER JOIN {$destTable} ON
                        ( {$destTable}.id = {$linkTable}.{$destCol} AND {$linkTable}.{$sourceCol} IN ($inClause) ) OR
                        ( {$destTable}.id = {$linkTable}.{$sourceCol} AND {$linkTable}.{$destCol} IN ($inClause2) )
                        {$addSql}
                        -- keep-cache";

                    $linkIDs = array_merge(
                        $linkIDs,
                        $linkIDs
                    );
                } else
                {
                    $sql = "
                    SELECT
                        {$destTable}.* {$sqlFilterStr},
                        {$linkTable}.{$sourceCol} AS linked_by
                    FROM {$linkTable}
                    INNER JOIN {$destTable} ON
                    ( {$destTable}.id = {$linkTable}.{$destCol} AND {$linkTable}.{$sourceCol} IN ($inClause) )
                    {$addSql}
                    -- keep-cache";
                }

                $bindings = array_merge($linkIDs, $bindings);
                $rows = $this->adapter->get($sql, $bindings);
                if ($this->flagUseCache)
                {
                    $this->putResultInCache(
                        $destType,
                        $key,
                        $rows
                    );
                }

                return $rows;
            }

            /**
             * @see QueryWriter::queryRecordLink.
             */
            public function queryRecordLink($sourceType, $destType, $sourceID, $destID)
            {
                list(
                    $sourceTable,
                    $destTable,
                    $linkTable,
                    $sourceCol,
                    $destCol
                ) = $this->getRelationalTablesAndColumns($sourceType, $destType);

                if ($this->flagUseCache)
                {
                    $key = $this->getCacheKey(
                        array(
                            $sourceType,
                            $destType,
                            $sourceID,
                            $destID,
                            "selectlink"
                        )
                    );

                    if ($cached = $this->getCached($linkTable, $key))
                    {
                        return $cached;
                    }
                }

                $sqlFilterStr = "";
                if (count(self::$sqlFilters))
                {
                    $linkType = $this->getAssocTable(
                        array(
                            $sourceType,
                            $destType
                        )
                    );

                    $sqlFilterStr = $this->getSQLFilterSnippet("{$linkType}");
                }

                if ($sourceTable === $destTable)
                {
                    $sql = "SELECT {$linkTable}.* {$sqlFilterStr} FROM {$linkTable}
                        WHERE ( {$sourceCol} = ? AND {$destCol} = ? ) OR
                        ( {$destCol} = ? AND {$sourceCol} = ? ) -- keep-cache";

                    /**
                     *
                     */
                    $row = $this->adapter->getRow(
                        $sql,
                        array(
                            $sourceID,
                            $destID,
                            $sourceID,
                            $destID
                        )
                    );
                } else
                {
                    $sql = "SELECT {$linkTable}.* {$sqlFilterStr} FROM {$linkTable}
                        WHERE {$sourceCol} = ? AND {$destCol} = ? -- keep-cache";

                    $row = $this->adapter->getRow(
                        $sql,
                        array(
                            $sourceID,
                            $destID
                        )
                    );
                }

                if ($this->flagUseCache)
                {
                    $this->putResultInCache(
                        $linkTable,
                        $key,
                        $row
                    );
                }

                return $row;
            }

            /**
             * Retorna ou conta todas as linhas do tipo especificado
             * que foram marcadas com uma das strings no vetor da lista
             * de tags especificada. Observe que o snippet SQL adicional
             * só pode ser usado para paginação; o snippet SQL será anexado
             * ao final da consulta.
             *
             * @param string  $type     O tipo de bean que você deseja consultar.
             * @param array   $tagList  Um vetor de strings, cada string contendo
             *                          um título de tag.
             * @param boolean $all      Se true retornará apenas registros que
             *                          foram associados a TODAS as tags da
             *                          lista.
             * @param string  $addSql   Adição de snippet SQL, para paginação.
             * @param array   $bindings Ligações de parâmetros para snippet
             *                          SQL adicional.
             * @param string  $wrap     String wrapper SQL (use %s para
             *                          subconsulta).
             * @return array.
             */
            private function queryTaggedGeneric($type, $tagList, $all = false, $addSql = "", $bindings = array(), $wrap = "%s")
            {
                if ($this->flagUseCache)
                {
                    $key = $this->getCacheKey(
                        array(
                            implode(
                                ",",
                                $tagList
                            ),

                            $all,
                            trim($addSql),

                            $bindings,
                            "selectTagged"
                        )
                    );

                    if ($cached = $this->getCached($type, $key))
                    {
                        return $cached;
                    }
                }

                $assocType = $this->getAssocTable(array($type, "tag"));
                $assocTable = $this->esc($assocType);
                $assocField = $type . "_id";
                $table = $this->esc($type);
                $slots = implode(",", array_fill(0, count($tagList), "?"));
                $score = ($all) ? count($tagList) : 1;

                $sql = "
                    SELECT {$table}.* FROM {$table}
                    INNER JOIN {$assocTable} ON {$assocField} = {$table}.id
                    INNER JOIN tag ON {$assocTable}.tag_id = tag.id
                    WHERE tag.title IN ({$slots})
                    GROUP BY {$table}.id
                    HAVING count({$table}.id) >= ?
                    {$addSql}
                    -- keep-cache
                ";

                $sql = sprintf($wrap,$sql);
                $bindings = array_merge($tagList, array($score), $bindings);
                $rows = $this->adapter->get($sql, $bindings);

                if ($this->flagUseCache)
                {
                    $this->putResultInCache(
                        $type,
                        $key,
                        $rows
                    );
                }

                return $rows;
            }

            /**
             * @see QueryWriter::queryTagged.
             */
            public function queryTagged($type, $tagList, $all = false, $addSql = "", $bindings = array())
            {
                return $this->queryTaggedGeneric(
                    $type,
                    $tagList,
                    $all,
                    $addSql,
                    $bindings
                );
            }

            /**
             * @see QueryWriter::queryCountTagged.
             */
            public function queryCountTagged($type, $tagList, $all = false, $addSql = "", $bindings = array())
            {
                $rows = $this->queryTaggedGeneric(
                    $type,
                    $tagList,
                    $all,
                    $addSql,
                    $bindings,
                    'SELECT COUNT(*) AS counted FROM (%s) AS counting'
                );

                return intval($rows[0]["counted"]);
            }

            /**
             * @see QueryWriter::queryRecordCount.
             */
            public function queryRecordCount($type, $conditions = array(), $addSql = NULL, $bindings = array())
            {
                if ($this->flagUseCache)
                {
                    $key = $this->getCacheKey(
                        array(
                            $conditions,
                            trim(
                                $addSql
                            ),

                            $bindings,
                            "count"
                        )
                    );

                    if ($cached = $this->getCached($type, $key))
                    {
                        return $cached;
                    }
                }

                $table  = $this->esc($type);
                if (is_array($conditions) && !empty($conditions))
                {
                    $sql = $this->makeSQLFromConditions(
                        $conditions,
                        $bindings,
                        $addSql
                    );
                } else
                {
                    $sql = $this->glueSQLCondition(
                        $addSql
                    );
                }

                $sql = $this->parseJoin($type, $sql);
                $sql = "SELECT COUNT(*) FROM {$table} {$sql} -- keep-cache";
                $count = (int) $this->adapter->getCell($sql, $bindings);

                if ($this->flagUseCache)
                {
                    $this->putResultInCache(
                        $type,
                        $key,
                        $count
                    );
                }

                return $count;
            }

            /**
             * @see QueryWriter::queryRecordCountRelated.
             */
            public function queryRecordCountRelated($sourceType, $destType, $linkID, $addSql = "", $bindings = array())
            {
                list(
                    $sourceTable,
                    $destTable,
                    $linkTable,
                    $sourceCol,
                    $destCol
                ) = $this->getRelationalTablesAndColumns($sourceType, $destType);

                if ($this->flagUseCache)
                {
                    $cacheType = "#{$sourceType}/{$destType}";
                    $key = $this->getCacheKey(
                        array(
                            $sourceType,
                            $destType,
                            $linkID,

                            trim($addSql),
                            $bindings,
                            "countrelated"
                        )
                    );

                    if ($cached = $this->getCached($cacheType, $key))
                    {
                        return $cached;
                    }
                }

                if ($sourceType === $destType)
                {
                    $sql = "
                        SELECT COUNT(*) FROM {$linkTable}
                        INNER JOIN {$destTable} ON
                        ( {$destTable}.id = {$linkTable}.{$destCol} AND {$linkTable}.{$sourceCol} = ? ) OR
                        ( {$destTable}.id = {$linkTable}.{$sourceCol} AND {$linkTable}.{$destCol} = ? )
                        {$addSql}
                        -- keep-cache";

                    $bindings = array_merge(
                        array(
                            $linkID,
                            $linkID
                        ),

                        $bindings
                    );
                } else
                {
                    $sql = "
                        SELECT COUNT(*) FROM {$linkTable}
                        INNER JOIN {$destTable} ON
                        ( {$destTable}.id = {$linkTable}.{$destCol} AND {$linkTable}.{$sourceCol} = ? )
                        {$addSql}
                        -- keep-cache";

                    $bindings = array_merge(
                        array(
                            $linkID
                        ),

                        $bindings
                    );
                }

                $count = (int) $this->adapter->getCell(
                    $sql,
                    $bindings
                );

                if ($this->flagUseCache)
                {
                    $this->putResultInCache(
                        $cacheType,
                        $key,
                        $count
                    );
                }

                return $count;
            }

            /**
             * @see QueryWriter::queryRecursiveCommonTableExpression.
             */
            public function queryRecursiveCommonTableExpression($type, $id, $up = true, $addSql = NULL, $bindings = array(), $selectForm = false)
            {
                if ($selectForm === QueryWriter::C_CTE_SELECT_COUNT)
                {
                    $selectForm = "count(redbeantree.*)";
                } elseif ($selectForm === QueryWriter::C_CTE_SELECT_NORMAL)
                {
                    $selectForm = "redbeantree.*";
                }

                $alias = $up ? "parent" : "child";
                $direction = $up ? " {$alias}.{$type}_id = {$type}.id " : " {$alias}.id = {$type}.{$type}_id ";

                /**
                 * Permite ligações de parâmetros numéricos e nomeados,
                 * se "0" existir, então numérico.
                 */
                if (array_key_exists(0, $bindings))
                {
                    array_unshift($bindings, $id);
                    $idSlot = "?";
                } else
                {
                    $idSlot = ":slot0";
                    $bindings[$idSlot] = $id;
                }

                $sql = $this->glueSQLCondition($addSql, QueryWriter::C_GLUE_WHERE);
                $sql = $this->parseJoin("redbeantree", $sql, $type);
                $rows = $this->adapter->get("
                    WITH RECURSIVE redbeantree AS
                    (
                        SELECT *
                        FROM {$type} WHERE {$type}.id = {$idSlot}
                        UNION ALL
                        SELECT {$type}.* FROM {$type}
                        INNER JOIN redbeantree {$alias} ON {$direction}
                    )
                    SELECT {$selectForm} FROM redbeantree {$sql};",
                    $bindings
                );

                return $rows;
            }

            /**
             * @see QueryWriter::deleteRecord.
             */
            public function deleteRecord($type, $conditions = array(), $addSql = NULL, $bindings = array())
            {
                $table  = $this->esc($type);
                if (is_array($conditions) && !empty($conditions))
                {
                    $sql = $this->makeSQLFromConditions(
                        $conditions,
                        $bindings,
                        $addSql
                    );
                } else
                {
                    $sql = $this->glueSQLCondition($addSql);
                }

                /**
                 *
                 */
                $sql = "DELETE FROM {$table} {$sql}";

                /**
                 *
                 */
                return $this->adapter->exec($sql, $bindings);
            }

            /**
             * @see QueryWriter::deleteRelations.
             */
            public function deleteRelations($sourceType, $destType, $sourceID)
            {
                list(
                    $sourceTable,
                    $destTable,
                    $linkTable,
                    $sourceCol,
                    $destCol
                ) = $this->getRelationalTablesAndColumns($sourceType, $destType);

                if ($sourceTable === $destTable)
                {
                    $sql = "DELETE FROM {$linkTable}
                        WHERE ( {$sourceCol} = ? ) OR
                        ( {$destCol} = ?  )
                    ";

                    $this->adapter->exec(
                        $sql,

                        array(
                            $sourceID,
                            $sourceID
                        )
                    );
                } else
                {
                    $sql = "DELETE FROM {$linkTable}
                        WHERE {$sourceCol} = ? ";

                    $this->adapter->exec(
                        $sql,
                        array(
                            $sourceID
                        )
                    );
                }
            }

            /**
             * @see QueryWriter::widenColumn.
             */
            public function widenColumn($type, $property, $dataType)
            {
                if (!isset($this->typeno_sqltype[$dataType]))
                {
                    return false;
                }

                $table   = $this->esc($type);
                $column  = $this->esc($property);
                $newType = $this->typeno_sqltype[$dataType];

                $this->adapter->exec(
                    sprintf(
                        $this->getDDLTemplate("widenColumn", $type, $column),
                        $type,
                        $column,
                        $column,
                        $newType
                    )
                );

                return true;
            }

            /**
             * @see QueryWriter::wipe.
             */
            public function wipe($type)
            {
                $table = $this->esc($type);
                $this->adapter->exec("TRUNCATE $table ");
            }

            /**
             * @see QueryWriter::renameAssocTable.
             */
            public function renameAssocTable($from, $to = NULL)
            {
                self::renameAssociation(
                    $from,
                    $to
                );
            }

            /**
             * @see QueryWriter::getAssocTable.
             */
            public function getAssocTable($types)
            {
                return self::getAssocTableFormat(
                    $types
                );
            }

            /**
             * Ativa ou desativa o cache. Padrão: desligado. Se o cache
             * estiver ativado, as consultas de recuperação disparadas
             * uma após a outra usarão um cache de linha de resultado.
             *
             * @param boolean.
             * @return void.
             */
            public function setUseCache($yesNo)
            {
                $this->flushCache();
                $this->flagUseCache = (bool) $yesNo;
            }

            /**
             * Flushes the Query Writer Cache.
             * Clears the internal query cache array and returns its overall
             * size.
             *
             * @return mixed
             */
            public function flushCache($newMaxCacheSizePerType = NULL, $countCache = true)
            {
                if (!is_null($newMaxCacheSizePerType) && $newMaxCacheSizePerType > 0)
                {
                    $this->maxCacheSizePerType = $newMaxCacheSizePerType;
                }

                $count = $countCache ? count($this->cache, COUNT_RECURSIVE) : NULL;
                $this->cache = array();

                return $count;
            }

            /**
             * @deprecated Use esc() em vez.
             *
             * @param string  $column   Coluna a ser escapada.
             * @param boolean $noQuotes Omitir aspas.
             * @return string.
             */
            public function safeColumn($column, $noQuotes = false)
            {
                return $this->esc(
                    $column,
                    $noQuotes
                );
            }

            /**
             * @deprecated Use esc() em vez.
             *
             * @param string  $table    Tabela a ser escapada.
             * @param boolean $noQuotes Omitir aspas.
             * @return string.
             */
            public function safeTable($table, $noQuotes = false)
            {
                return $this->esc(
                    $table,
                    $noQuotes
                );
            }

            /**
             * @see QueryWriter::addUniqueConstraint.
             */
            public function addUniqueIndex($type, $properties)
            {
                return $this->addUniqueConstraint(
                    $type,
                    $properties
                );
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\QueryWriter
    {
        use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\Adapter\DBAdapter as DBAdapter;
        use RedBeanPHP\Adapter as Adapter;
        use RedBeanPHP\RedException\SQL as SQLException;


        /**
         * RedBeanPHP MySQLWriter.
         * This is a QueryWriter class for RedBeanPHP.
         * This QueryWriter provides support for the MySQL/MariaDB database platform.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class MySQL extends AQueryWriter implements QueryWriter
        {
            /**
             * Tipos de dados.
             */

            /**
             *
             */
            const C_DATATYPE_BOOL = 0;

            /**
             *
             */
            const C_DATATYPE_UINT32 = 2;

            /**
             *
             */
            const C_DATATYPE_DOUBLE = 3;

            /**
             * O InnoDB não pode indexar varchar(255) utf8mb4 - portanto,
             * mantenha 191 o maior tempo possível.
             */
            const C_DATATYPE_TEXT7 = 4;

            /**
             *
             */
            const C_DATATYPE_TEXT8 = 5;

            /**
             *
             */
            const C_DATATYPE_TEXT16 = 6;

            /**
             *
             */
            const C_DATATYPE_TEXT32 = 7;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_DATE = 80;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_DATETIME = 81;

            /**
             * Coluna de tempo MySQL (somente manual).
             */
            const C_DATATYPE_SPECIAL_TIME = 83;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_POINT = 90;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_LINESTRING = 91;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_POLYGON = 92;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_MONEY = 93;

            /**
             * Suporte JSON (somente manual).
             */
            const C_DATATYPE_SPECIAL_JSON = 94;

            /**
             *
             */
            const C_DATATYPE_SPECIFIED = 99;

            /**
             * @var DBAdapter.
             */
            protected $adapter;

            /**
             * @var string.
             */
            protected $quoteCharacter = "`";

            /**
             * @var array.
             */
            protected $DDLTemplates = array(
                "addColumn" => array(
                    "*" => 'ALTER TABLE %s ADD %s %s '
                ),

                "createTable" => array(
                    "*" => 'CREATE TABLE %s (id INT( 11 ) UNSIGNED NOT NULL AUTO_INCREMENT, PRIMARY KEY ( id )) ENGINE = InnoDB DEFAULT CHARSET=%s COLLATE=%s '
                ),

                "widenColumn" => array(
                    "*" => 'ALTER TABLE `%s` CHANGE %s %s %s '
                )
            );

            /**
             * @see AQueryWriter::getKeyMapForType.
             */
            protected function getKeyMapForType($type)
            {
                $databaseName = $this->adapter->getCell("SELECT DATABASE()");
                $table = $this->esc($type, true);
                $keys = $this->adapter->get('
                    SELECT
                        information_schema.key_column_usage.constraint_name AS `name`,
                        information_schema.key_column_usage.referenced_table_name AS `table`,
                        information_schema.key_column_usage.column_name AS `from`,
                        information_schema.key_column_usage.referenced_column_name AS `to`,
                        information_schema.referential_constraints.update_rule AS `on_update`,
                        information_schema.referential_constraints.delete_rule AS `on_delete`
                        FROM information_schema.key_column_usage
                        INNER JOIN information_schema.referential_constraints
                        ON information_schema.referential_constraints.constraint_name = information_schema.key_column_usage.constraint_name
                    WHERE
                        information_schema.key_column_usage.table_schema = :database
                        AND information_schema.referential_constraints.constraint_schema  = :database
                        AND information_schema.key_column_usage.constraint_schema  = :database
                        AND information_schema.key_column_usage.table_name = :table
                        AND information_schema.key_column_usage.constraint_name != \'PRIMARY\'
                        AND information_schema.key_column_usage.referenced_table_name IS NOT NULL
                ', array(":database" => $databaseName, ":table" => $table));

                $keyInfoList = array();
                foreach ($keys as $k)
                {
                    $label = $this->makeFKLabel(
                        $k["from"],
                        $k["table"],
                        $k["to"]
                    );

                    $keyInfoList[$label] = array(
                        "name" => $k["name"],
                        "from" => $k["from"],
                        "table" => $k["table"],
                        "to" => $k["to"],
                        "on_update" => $k["on_update"],
                        "on_delete" => $k["on_delete"]
                    );
                }

                /**
                 *
                 */
                return $keyInfoList;
            }

            /**
             * Construtor. Na maioria das vezes, você não precisa usar
             * esse construtor, pois a fachada se encarrega de construir
             * e conectar os objetos principais do RedBeanPHP. No entanto,
             * se você quiser montar uma instância OODB sozinho, é assim
             * que funciona:
             *
             * Uso:
             *     <code>
             *         $database = new RPDO($dsn, $user, $pass);
             *         $adapter = new DBAdapter($database);
             *         $writer = new PostgresWriter($adapter);
             *         $oodb = new OODB($writer, false);
             *
             *         $bean = $oodb->dispense("bean");
             *         $bean->name = "coffeeBean";
             *
             *         $id = $oodb->store($bean);
             *         $bean = $oodb->load("bean", $id);
             *     </code>
             *
             * O exemplo acima cria os 3 objetos principais do RedBeanPHP:
             * o Adaptador, o Query Writer e a instância OODB e os conecta.
             * O exemplo também demonstra alguns dos métodos que podem ser
             * usados com OODB, como você pode ver, eles se assemelham muito
             * aos seus equivalentes de fachada.
             *
             * O processo de ligação: crie uma instância RPDO usando os
             * parâmetros de conexão do banco de dados. Crie um adaptador
             * de banco de dados a partir do objeto RPDO e passe-o para o
             * construtor do gravador. Em seguida, crie uma instância OODB
             * do gravador. Agora você tem um objeto OODB.
             *
             * @param Adapter $adapter Adaptador de banco de dados.
             * @param array   $options Vetor de opções.
             */
            public function __construct(Adapter $adapter, $options = array())
            {
                $this->typeno_sqltype = array(
                    MySQL::C_DATATYPE_BOOL => " TINYINT(1) UNSIGNED ",
                    MySQL::C_DATATYPE_UINT32 => " INT(11) UNSIGNED ",
                    MySQL::C_DATATYPE_DOUBLE => " DOUBLE ",
                    MySQL::C_DATATYPE_TEXT7 => " VARCHAR(191) ",
                    MYSQL::C_DATATYPE_TEXT8 => " VARCHAR(255) ",
                    MySQL::C_DATATYPE_TEXT16 => " TEXT ",
                    MySQL::C_DATATYPE_TEXT32 => " LONGTEXT ",
                    MySQL::C_DATATYPE_SPECIAL_DATE => " DATE ",
                    MySQL::C_DATATYPE_SPECIAL_DATETIME => " DATETIME ",
                    MySQL::C_DATATYPE_SPECIAL_TIME => " TIME ",
                    MySQL::C_DATATYPE_SPECIAL_POINT => " POINT ",
                    MySQL::C_DATATYPE_SPECIAL_LINESTRING => " LINESTRING ",
                    MySQL::C_DATATYPE_SPECIAL_POLYGON => " POLYGON ",
                    MySQL::C_DATATYPE_SPECIAL_MONEY => " DECIMAL(10,2) ",
                    MYSQL::C_DATATYPE_SPECIAL_JSON => " JSON "
                );

                $this->sqltype_typeno = array();
                foreach ($this->typeno_sqltype as $k => $v)
                {
                    $this->sqltype_typeno[
                        trim(
                            strtolower($v)
                        )
                    ] = $k;
                }

                $this->adapter = $adapter;
                $this->encoding = $this->adapter->getDatabase()->getMysqlEncoding();
                $me = $this;

                if (!isset($options["noInitcode"]))
                {
                    $this->adapter->setInitCode(function($version) use(&$me)
                    {
                        try
                        {
                            if (strpos($version, "maria") === false && intval($version) >= 8)
                            {
                                $me->useFeature("ignoreDisplayWidth");
                            }
                        } catch (\Exception $e)
                        {
                        }
                    });
                }
            }

            /**
             * Ativa certos recursos/dialetos.
             *
             * - ignoreDisplayWidth obrigatório para MySQL8+
             *   (definido automaticamente por setup() se você passar dsn
             *    em vez do objeto PDO).
             *
             * @param string $name ID do recurso.
             * @return void.
             */
            public function useFeature($name)
            {
                if ($name == "ignoreDisplayWidth")
                {
                    $this->typeno_sqltype[MySQL::C_DATATYPE_BOOL] = " TINYINT UNSIGNED ";
                    $this->typeno_sqltype[MySQL::C_DATATYPE_UINT32] = " INT UNSIGNED ";

                    foreach ($this->typeno_sqltype as $k => $v)
                    {
                        $this->sqltype_typeno[
                            trim(
                                strtolower($v)
                            )
                        ] = $k;
                    }
                }
            }

            /**
             * Este método retorna o tipo de dados a ser usado para
             * IDS de chave primária e chaves estrangeiras. Retorna
             * um se o tipo de dados for constante.
             *
             * @return integer.
             */
            public function getTypeForID()
            {
                return self::C_DATATYPE_UINT32;
            }

            /**
             * @see QueryWriter::getTables.
             */
            public function getTables()
            {
                return $this->adapter->getCol("show tables");
            }

            /**
             * @see QueryWriter::createTable.
             */
            public function createTable($type)
            {
                $table = $this->esc($type);

                $charset_collate = $this
                    ->adapter
                    ->getDatabase()
                    ->getMysqlEncoding(true);

                $charset = $charset_collate["charset"];
                $collate = $charset_collate["collate"];

                $sql = sprintf(
                    $this->getDDLTemplate("createTable", $type),
                    $table,
                    $charset,
                    $collate
                );

                $this->adapter->exec($sql);
            }

            /**
             * @see QueryWriter::getColumns.
             */
            public function getColumns($table)
            {
                $columnsRaw = $this
                    ->adapter
                    ->get("DESCRIBE " . $this->esc($table));

                $columns = array();
                foreach ($columnsRaw as $r)
                {
                    $columns[$r["Field"]] = $r["Type"];
                }

                return $columns;
            }

            /**
             * @see QueryWriter::scanType.
             */
            public function scanType($value, $flagSpecial = false)
            {
                if (is_null($value))
                {
                    return MySQL::C_DATATYPE_BOOL;
                }

                if ($value === INF)
                {
                    return MySQL::C_DATATYPE_TEXT7;
                }

                if ($flagSpecial)
                {
                    if (preg_match('/^-?\d+\.\d{2}$/', $value))
                    {
                        return MySQL::C_DATATYPE_SPECIAL_MONEY;
                    }

                    if (preg_match('/^\d{4}\-\d\d-\d\d$/', $value))
                    {
                        return MySQL::C_DATATYPE_SPECIAL_DATE;
                    }

                    if (preg_match('/^\d{4}\-\d\d-\d\d\s\d\d:\d\d:\d\d$/', $value))
                    {
                        return MySQL::C_DATATYPE_SPECIAL_DATETIME;
                    }

                    if (preg_match('/^POINT\(/', $value))
                    {
                        return MySQL::C_DATATYPE_SPECIAL_POINT;
                    }

                    if (preg_match('/^LINESTRING\(/', $value))
                    {
                        return MySQL::C_DATATYPE_SPECIAL_LINESTRING;
                    }

                    if (preg_match('/^POLYGON\(/', $value))
                    {
                        return MySQL::C_DATATYPE_SPECIAL_POLYGON;
                    }

                    if (self::$flagUseJSONColumns && $this->isJSON($value))
                    {
                        return self::C_DATATYPE_SPECIAL_JSON;
                    }
                }

                /**
                 * Setter transforma true false em 0 e 1 porque o
                 * banco de dados não possui bools reais (true e
                 * false apenas para teste ?).
                 */
                if ($value === false ||
                    $value === true ||
                    $value === "0" ||
                    $value === "1" ||
                    $value === 0 ||
                    $value === 1)
                {
                    return MySQL::C_DATATYPE_BOOL;
                }

                if (is_float($value))
                {
                    return self::C_DATATYPE_DOUBLE;
                }

                if (!$this->startsWithZeros($value))
                {
                    if (is_numeric($value) && (floor($value) == $value) && $value >= 0 && $value <= 4294967295)
                    {
                        return MySQL::C_DATATYPE_UINT32;
                    }

                    if (is_numeric($value))
                    {
                        return MySQL::C_DATATYPE_DOUBLE;
                    }
                }

                if (mb_strlen($value, "UTF-8") <= 191)
                {
                    return MySQL::C_DATATYPE_TEXT7;
                }

                if (mb_strlen($value, "UTF-8") <= 255)
                {
                    return MySQL::C_DATATYPE_TEXT8;
                }

                if (mb_strlen($value, "UTF-8") <= 65535)
                {
                    return MySQL::C_DATATYPE_TEXT16;
                }

                return MySQL::C_DATATYPE_TEXT32;
            }

            /**
             * @see QueryWriter::code.
             */
            public function code($typedescription, $includeSpecials = false)
            {
                if (isset($this->sqltype_typeno[$typedescription]))
                {
                    $r = $this->sqltype_typeno[$typedescription];
                } else
                {
                    $r = self::C_DATATYPE_SPECIFIED;
                }

                if ($includeSpecials)
                {
                    return $r;
                }

                if ($r >= QueryWriter::C_DATATYPE_RANGE_SPECIAL)
                {
                    return self::C_DATATYPE_SPECIFIED;
                }

                return $r;
            }

            /**
             * @see QueryWriter::addUniqueIndex.
             */
            public function addUniqueConstraint($type, $properties)
            {
                $tableNoQ = $this->esc($type, true);
                $columns = array();

                foreach($properties as $key => $column)
                {
                    $columns[$key] = $this->esc($column);
                }

                /**
                 *
                 */
                $table = $this->esc($type);

                /**
                 * Caso contrário, obteremos vários índices devido aos
                 * efeitos do pedido.
                 */
                sort($columns);

                /**
                 *
                 */
                $name = "UQ_" . sha1(
                    implode(",", $columns)
                );

                try
                {
                    $sql = "ALTER TABLE $table
                            ADD UNIQUE INDEX $name (" . implode( ",", $columns ) . ")";

                    $this->adapter->exec($sql);
                } catch (SQLException $e)
                {
                    /**
                     * Não faça nada, não use alter table ignore, isso
                     * excluirá registros duplicados de três maneiras !
                     */
                    return false;
                }

                /**
                 *
                 */
                return true;
            }

            /**
             * @see QueryWriter::addIndex.
             */
            public function addIndex($type, $name, $property)
            {
                try
                {
                    $table = $this->esc($type);
                    $name = preg_replace('/\W/', "", $name);

                    $column = $this->esc($property);
                    $this->adapter->exec("CREATE INDEX $name ON $table ($column) ");

                    return true;
                } catch (SQLException $e)
                {
                    return false;
                }
            }

            /**
             * @see QueryWriter::addFK.
             */
            public function addFK($type, $targetType, $property, $targetProperty, $isDependent = false)
            {
                $table = $this->esc($type);
                $targetTable = $this->esc($targetType);
                $targetTableNoQ = $this->esc($targetType, true);
                $field = $this->esc($property);
                $fieldNoQ = $this->esc($property, true);
                $targetField = $this->esc($targetProperty);
                $targetFieldNoQ = $this->esc($targetProperty, true);
                $tableNoQ = $this->esc($type, true);
                $fieldNoQ = $this->esc($property, true);

                if (!is_null($this->getForeignKeyForTypeProperty($tableNoQ, $fieldNoQ)))
                {
                    return false;
                }

                /**
                 * Amplie a coluna se ela for incapaz de representar uma
                 * chave estrangeira (pelo menos INT).
                 */
                $columns = $this->getColumns($tableNoQ);
                $idType = $this->getTypeForID();

                if ($this->code($columns[$fieldNoQ]) !==  $idType)
                {
                    $this->widenColumn(
                        $type,
                        $property,
                        $idType
                    );
                }

                /**
                 *
                 */
                $fkName = "fk_".($tableNoQ."_".$fieldNoQ);
                $cName = "c_".$fkName;

                try
                {
                    $this->adapter->exec( "
                        ALTER TABLE {$table}
                        ADD CONSTRAINT $cName
                        FOREIGN KEY $fkName ( `{$fieldNoQ}` ) REFERENCES `{$targetTableNoQ}`
                        (`{$targetFieldNoQ}`) ON DELETE " . ( $isDependent ? 'CASCADE' : 'SET NULL' ) . ' ON UPDATE '.( $isDependent ? 'CASCADE' : 'SET NULL' ).';');
                } catch (SQLException $e)
                {
                    /**
                     * A falha nas restrições fk não é um problema.
                     */
                }

                return true;
            }

            /**
             * @see QueryWriter::sqlStateIn.
             */
            public function sqlStateIn($state, $list, $extraDriverDetails = array())
            {
                $stateMap = array(
                    "42S02" => QueryWriter::C_SQLSTATE_NO_SUCH_TABLE,
                    "42S22" => QueryWriter::C_SQLSTATE_NO_SUCH_COLUMN,
                    "23000" => QueryWriter::C_SQLSTATE_INTEGRITY_CONSTRAINT_VIOLATION,
                );

                if ($state == "HY000" && !empty($extraDriverDetails[1]))
                {
                    $driverCode = $extraDriverDetails[1];
                    if ($driverCode == "1205" && in_array(QueryWriter::C_SQLSTATE_LOCK_TIMEOUT, $list))
                    {
                        return true;
                    }
                }

                return in_array(
                    (
                        isset($stateMap[$state]) ? $stateMap[$state] : "0"
                    ),

                    $list
                );
            }

            /**
             * @see QueryWriter::wipeAll.
             */
            public function wipeAll()
            {
                if (AQueryWriter::$noNuke)
                {
                    throw new \Exception(
                        "The nuke() command has been disabled using noNuke() or R::feature(novice/...)."
                    );
                }

                $this->adapter->exec("SET FOREIGN_KEY_CHECKS = 0;");
                foreach ($this->getTables() as $t)
                {
                    try
                    {
                        $this->adapter->exec(
                            "DROP TABLE IF EXISTS `$t`"
                        );
                    } catch (SQLException $e)
                    {
                    }

                    try
                    {
                        $this->adapter->exec(
                            "DROP VIEW IF EXISTS `$t`"
                        );
                    } catch (SQLException $e)
                    {
                    }
                }

                $this->adapter->exec(
                    "SET FOREIGN_KEY_CHECKS = 1;"
                );
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\QueryWriter
    {
        use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\Adapter\DBAdapter as DBAdapter;
        use RedBeanPHP\Adapter as Adapter;
        use RedBeanPHP\RedException\SQL as SQLException;


        /**
         * RedBeanPHP SQLiteWriter com suporte para tipos SQLite.
         * Esta é uma classe QueryWriter para RedBeanPHP. Este
         * QueryWriter fornece suporte para a plataforma de
         * banco de dados SQLite.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class SQLiteT extends AQueryWriter implements QueryWriter
        {
            /**
             * Tipos de dados.
             */

            /**
             *
             */
            const C_DATATYPE_INTEGER = 0;

            /**
             *
             */
            const C_DATATYPE_NUMERIC = 1;

            /**
             *
             */
            const C_DATATYPE_TEXT = 2;

            /**
             *
             */
            const C_DATATYPE_SPECIFIED = 99;

            /**
             * @var DBAdapter.
             */
            protected $adapter;

            /**
             * @var string.
             */
            protected $quoteCharacter = "`";

            /**
             * @var array.
             */
            protected $tableArchive = array();

            /**
             * @var array.
             */
            protected $DDLTemplates = array(
                "addColumn" => array(
                    "*" => 'ALTER TABLE `%s` ADD `%s` %s'
                ),

                "createTable" => array(
                    "*" => 'CREATE TABLE %s ( id INTEGER PRIMARY KEY AUTOINCREMENT )'
                ),

                "widenColumn" => array(
                    "*" => ',`%s` %s '
                )
            );

            /**
             * Obtém todas as informações sobre uma tabela (de um tipo).
             *
             * Formatar:
             *     array(
             *         name => Nome da mesa.
             *         columns => array(name => datatype)
             *         indexes => array() linhas de informações de índice
             *                            bruto da consulta PRAGMA.
             *         keys => array() linhas de informações chave brutas
             *                         da consulta PRAGMA.
             *     )
             *
             * @param string $type tipo sobre o qual deseja obter informações.
             * @return array.
             */
            protected function getTable($type)
            {
                $tableName = $this->esc($type, true);
                $columns = $this->getColumns($type);
                $indexes = $this->getIndexes($type);
                $keys = $this->getKeyMapForType($type);

                /**
                 *
                 */
                $table = array(
                    "columns" => $columns,
                    "indexes" => $indexes,
                    "keys" => $keys,
                    "name" => $tableName
                );

                /**
                 *
                 */
                $this->tableArchive[$tableName] = $table;

                /**
                 *
                 */
                return $table;
            }

            /**
             * Coloca uma mesa. Atualiza a estrutura da tabela. No
             * SQLite não podemos alterar colunas, eliminar colunas,
             * alterar ou adicionar chaves estrangeiras, portanto
             * temos uma função de reconstrução de tabela. Você
             * simplesmente carrega sua tabela com getTable(),
             * modifica-a e depois armazena-a com putTable()...
             *
             * @param array $tableMap vetor de informações.
             * @return void.
             */
            protected function putTable($tableMap)
            {
                $table = $tableMap["name"];
                $q = array();
                $q[] = "DROP TABLE IF EXISTS tmp_backup;";

                $oldColumnNames = array_keys(
                    $this->getColumns(
                        $table
                    )
                );

                foreach ($oldColumnNames as $k => $v)
                {
                    $oldColumnNames[$k] = "`$v`";
                }

                $q[] = "CREATE TEMPORARY TABLE tmp_backup(" . implode(",", $oldColumnNames) . ");";
                $q[] = "INSERT INTO tmp_backup SELECT * FROM `$table`;";
                $q[] = "PRAGMA foreign_keys = 0 ";
                $q[] = "DROP TABLE `$table`;";

                $newTableDefStr = "";
                foreach ($tableMap["columns"] as $column => $type)
                {
                    if ($column != "id")
                    {
                        $newTableDefStr .= sprintf(
                            $this->getDDLTemplate("widenColumn", $table, $column),
                            $column,
                            $type
                        );
                    }
                }

                $fkDef = "";
                foreach ($tableMap["keys"] as $key)
                {
                    $fkDef .= ", FOREIGN KEY(`{$key['from']}`)
                                 REFERENCES `{$key['table']}`(`{$key['to']}`)
                                 ON DELETE {$key['on_delete']} ON UPDATE {$key['on_update']}";
                }

                /**
                 *
                 */
                $q[] = "CREATE TABLE `$table` ( `id` INTEGER PRIMARY KEY AUTOINCREMENT  $newTableDefStr  $fkDef );";

                /**
                 *
                 */
                foreach ($tableMap["indexes"] as $name => $index)
                {
                    if (strpos($name, "UQ_") === 0)
                    {
                        $cols = explode(
                            "__",
                            substr(
                                $name,
                                strlen(
                                    "UQ_" . $table
                                )
                            )
                        );

                        foreach ($cols as $k => $v)
                        {
                            $cols[$k] = "`$v`";
                        }

                        $q[] = "CREATE UNIQUE INDEX $name ON `$table` (" . implode( ",", $cols ) . ")";
                    } else
                    {
                        $q[] = "CREATE INDEX $name ON `$table` ({$index['name']}) ";
                    }
                }

                $q[] = "INSERT INTO `$table` SELECT * FROM tmp_backup;";
                $q[] = "DROP TABLE tmp_backup;";
                $q[] = "PRAGMA foreign_keys = 1 ";

                foreach ($q as $sq)
                {
                    $this->adapter->exec($sq);
                }
            }

            /**
             * Retorna um array que descreve os índices do tipo $type.
             *
             * @param string $type tipo para descrever índices de.
             * @return array.
             */
            protected function getIndexes($type)
            {
                $table = $this->esc($type, true);
                $indexes = $this->adapter->get("PRAGMA index_list('$table')");

                $indexInfoList = array();
                foreach ($indexes as $i)
                {
                    $indexInfoList[$i["name"]] = $this->adapter->getRow("PRAGMA index_info('{$i['name']}') ");
                    $indexInfoList[$i["name"]]["unique"] = $i["unique"];
                }

                return $indexInfoList;
            }

            /**
             * Adiciona uma chave estrangeira a um tipo.
             * Observação: não é possível colocar isso no
             * try-catch porque isso pode ocultar o fato de
             * que o banco de dados foi danificado.
             *
             * @param  string  $type        Tipo do qual você deseja modificar a tabela.
             * @param  string  $targetType  Tipo de destino.
             * @param  string  $field       Campo do tipo que precisa obter o fk.
             * @param  string  $targetField Campo para onde o fk precisa apontar.
             * @param  integer $buildopt    0 = NO ACTION, 1 = ON DELETE CASCADE.
             * @return boolean.
             */
            protected function buildFK($type, $targetType, $property, $targetProperty, $constraint = false)
            {
                $table = $this->esc($type, true);
                $targetTable = $this->esc($targetType, true);
                $column = $this->esc($property, true);
                $targetColumn = $this->esc($targetProperty, true);
                $tables = $this->getTables();

                if (!in_array($targetTable, $tables))
                {
                    return false;
                }

                if (!is_null($this->getForeignKeyForTypeProperty($table, $column)))
                {
                    return false;
                }

                $t = $this->getTable($table);
                $consSQL = ($constraint ? "CASCADE" : "SET NULL");
                $label = "from_" . $column . "_to_table_" . $targetTable . "_col_" . $targetColumn;

                /**
                 *
                 */
                $t["keys"][$label] = array(
                    "table" => $targetTable,
                    "from" => $column,
                    "to" => $targetColumn,
                    "on_update" => $consSQL,
                    "on_delete" => $consSQL
                );

                /**
                 *
                 */
                $this->putTable($t);

                /**
                 *
                 */
                return true;
            }

            /**
             * @see AQueryWriter::getKeyMapForType.
             */
            protected function getKeyMapForType( $type )
            {
                $table = $this->esc($type, true);
                $keys = $this->adapter->get("PRAGMA foreign_key_list('$table')");
                $keyInfoList = array();

                foreach ($keys as $k)
                {
                    $label = $this->makeFKLabel(
                        $k["from"],
                        $k["table"],
                        $k["to"]
                    );

                    $keyInfoList[$label] = array(
                        "name" => $label,
                        "from" => $k["from"],
                        "table" => $k["table"],
                        "to" => $k["to"],
                        "on_update" => $k["on_update"],
                        "on_delete" => $k["on_delete"]
                    );
                }

                return $keyInfoList;
            }

            /**
             * Construtor:
             * Na maioria das vezes, você não precisa usar esse
             * construtor, pois a fachada se encarrega de construir
             * e conectar os objetos principais do RedBeanPHP. No
             * entanto, se você quiser montar uma instância OODB
             * sozinho, é assim que funciona:
             *
             * Uso:
             *     <code>
             *         $database = new RPDO($dsn, $user, $pass);
             *         $adapter = new DBAdapter($database);
             *         $writer = new PostgresWriter($adapter);
             *         $oodb = new OODB($writer, false);
             *
             *         $bean = $oodb->dispense("bean");
             *         $bean->name = "coffeeBean";
             *
             *         $id = $oodb->store($bean);
             *         $bean = $oodb->load("bean", $id);
             *     </code>
             *
             * O exemplo acima cria os 3 objetos principais do RedBeanPHP:
             * o Adaptador, o Query Writer e a instância OODB e os conecta.
             * O exemplo também demonstra alguns dos métodos que podem ser
             * usados com OODB, como você pode ver, eles se assemelham
             * muito aos seus equivalentes de fachada.
             *
             * O processo de ligação: crie uma instância RPDO usando os
             * parâmetros de conexão do banco de dados. Crie um adaptador
             * de banco de dados a partir do objeto RPDO e passe-o para o
             * construtor do gravador. Em seguida, crie uma instância OODB
             * do gravador. Agora você tem um objeto OODB.
             *
             * @param Adapter $adapter Adaptador de banco de dados.
             */
            public function __construct(Adapter $adapter)
            {
                $this->typeno_sqltype = array(
                    SQLiteT::C_DATATYPE_INTEGER => "INTEGER",
                    SQLiteT::C_DATATYPE_NUMERIC => "NUMERIC",
                    SQLiteT::C_DATATYPE_TEXT => "TEXT",
                );

                $this->sqltype_typeno = array();
                foreach ($this->typeno_sqltype as $k => $v)
                {
                    $this->sqltype_typeno[$v] = $k;
                }

                $this->adapter = $adapter;
                $this->adapter->setOption(
                    "setInitQuery",
                    " PRAGMA foreign_keys = 1 "
                );
            }

            /**
             * Este método retorna o tipo de dados a ser usado
             * para IDS de chave primária e chaves estrangeiras.
             * Retorna um se o tipo de dados for constante.
             *
             * @return integer $const tipo de dados a ser usado para IDS.
             */
            public function getTypeForID()
            {
                return self::C_DATATYPE_INTEGER;
            }

            /**
             * @see QueryWriter::scanType.
             */
            public function scanType($value, $flagSpecial = false)
            {
                if ($value === NULL)
                {
                    return self::C_DATATYPE_INTEGER;
                }

                if ($value === INF)
                {
                    return self::C_DATATYPE_TEXT;
                }

                if ($this->startsWithZeros($value))
                {
                    return self::C_DATATYPE_TEXT;
                }

                if ($value === true || $value === false)
                {
                    return self::C_DATATYPE_INTEGER;
                }

                if (is_numeric($value) && (intval($value) == $value) && $value < 2147483648 && $value > -2147483648)
                {
                    return self::C_DATATYPE_INTEGER;
                }

                if ((is_numeric($value) && $value < 2147483648 && $value > -2147483648) ||
                    preg_match('/\d{4}\-\d\d\-\d\d/', $value) ||
                    preg_match('/\d{4}\-\d\d\-\d\d\s\d\d:\d\d:\d\d/', $value))
                {
                    return self::C_DATATYPE_NUMERIC;
                }

                return self::C_DATATYPE_TEXT;
            }

            /**
             * @see QueryWriter::addColumn.
             */
            public function addColumn($table, $column, $type)
            {
                $column = $this->check($column);
                $table = $this->check($table);
                $type = $this->typeno_sqltype[$type];
                $this->adapter->exec(
                    sprintf(
                        $this->getDDLTemplate("addColumn", $table, $column),
                        $table,
                        $column,
                        $type
                    )
                );
            }

            /**
             * @see QueryWriter::code.
             */
            public function code($typedescription, $includeSpecials = false)
            {
                $r = (
                    (
                        isset(
                            $this->sqltype_typeno[$typedescription]
                        )
                    ) ? $this->sqltype_typeno[$typedescription] : 99
                );

                return $r;
            }

            /**
             * @see QueryWriter::widenColumn.
             */
            public function widenColumn($type, $column, $datatype)
            {
                $t = $this->getTable($type);
                $t["columns"][$column] = $this->typeno_sqltype[$datatype];

                $this->putTable($t);
            }

            /**
             * @see QueryWriter::getTables();
             */
            public function getTables()
            {
                return $this->adapter->getCol("SELECT name FROM sqlite_master
                    WHERE type='table' AND name!='sqlite_sequence';");
            }

            /**
             * @see QueryWriter::createTable.
             */
            public function createTable($type)
            {
                $table = $this->esc($type);
                $sql = sprintf(
                    $this->getDDLTemplate("createTable", $type),
                    $table
                );

                $this->adapter->exec($sql);
            }

            /**
             * @see QueryWriter::getColumns.
             */
            public function getColumns($table)
            {
                $table = $this->esc($table, true);
                $columnsRaw = $this->adapter->get("PRAGMA table_info('$table')");
                $columns    = array();

                foreach ($columnsRaw as $r)
                {
                    $columns[$r["name"]] = $r["type"];
                }

                return $columns;
            }

            /**
             * @see QueryWriter::addUniqueIndex.
             */
            public function addUniqueConstraint($type, $properties)
            {
                $tableNoQ = $this->esc($type, true);
                $name = "UQ_" . $this->esc($type, true) . implode("__", $properties);
                $t = $this->getTable($type);
                $t["indexes"][$name] = array(
                    "name" => $name
                );

                try
                {
                    $this->putTable($t);
                } catch(SQLException $e)
                {
                    return false;
                }

                return true;
            }

            /**
             * @see QueryWriter::sqlStateIn.
             */
            public function sqlStateIn($state, $list, $extraDriverDetails = array())
            {
                $stateMap = array(
                    "23000" => QueryWriter::C_SQLSTATE_INTEGRITY_CONSTRAINT_VIOLATION
                );

                if ($state == "HY000" && isset($extraDriverDetails[1]) && $extraDriverDetails[1] == 1 && (in_array(QueryWriter::C_SQLSTATE_NO_SUCH_TABLE, $list) || in_array(QueryWriter::C_SQLSTATE_NO_SUCH_COLUMN, $list)))
                {
                    return true;
                }

                return in_array(
                    (
                        isset($stateMap[$state]) ? $stateMap[$state] : "0"
                    ),
                    $list
                );
            }

            /**
             * Sets an SQL snippet to be used for the next queryRecord() operation.
             * SQLite has no SELECT-FOR-UPDATE and filters this.
             *
             * @param string $sqlSelectSnippet SQL snippet to use in SELECT statement.
             *
             * @return self
             */
            public function setSQLSelectSnippet($sqlSelectSnippet = "")
            {
                if ($sqlSelectSnippet === AQueryWriter::C_SELECT_SNIPPET_FOR_UPDATE)
                {
                    $sqlSelectSnippet = "";
                }

                $this->sqlSelectSnippet = $sqlSelectSnippet;
                return $this;
            }

            /**
             * @see QueryWriter::addIndex.
             */
            public function addIndex($type, $name, $column)
            {
                $columns = $this->getColumns($type);
                if (!isset($columns[$column]))
                {
                    return false;
                }

                $table = $this->esc($type);
                $name = preg_replace('/\W/', "", $name);
                $column = $this->esc($column, true);

                try
                {
                    $t = $this->getTable($type);
                    $t["indexes"][$name] = array("name" => $column);
                    $this->putTable($t);

                    return true;
                } catch(SQLException $exception)
                {
                    return false;
                }
            }

            /**
             * @see QueryWriter::wipe.
             */
            public function wipe($type)
            {
                $table = $this->esc($type);
                $this->adapter->exec("DELETE FROM $table ");
            }

            /**
             * @see QueryWriter::addFK.
             */
            public function addFK($type, $targetType, $property, $targetProperty, $isDep = false)
            {
                return $this->buildFK(
                    $type,
                    $targetType,
                    $property,
                    $targetProperty,
                    $isDep
                );
            }

            /**
             * @see QueryWriter::wipeAll.
             */
            public function wipeAll()
            {
                if (AQueryWriter::$noNuke)
                {
                    throw new \Exception(
                        "The nuke() command has been disabled using noNuke() or R::feature(novice/...)."
                    );
                }

                $this->adapter->exec("PRAGMA foreign_keys = 0 ");
                foreach ($this->getTables() as $t)
                {
                    try
                    {
                        $this->adapter->exec("DROP TABLE IF EXISTS `$t`");
                    } catch (SQLException $e)
                    {
                    }

                    try
                    {
                        $this->adapter->exec("DROP TABLE IF EXISTS `$t`");
                    } catch (SQLException $e)
                    {
                    }
                }

                $this->adapter->exec("PRAGMA foreign_keys = 1 ");
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\QueryWriter
    {
        use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\Adapter\DBAdapter as DBAdapter;
        use RedBeanPHP\Adapter as Adapter;
        use RedBeanPHP\RedException\SQL as SQLException;


        /**
         * Escritor de consultas RedBeanPHP PostgreSQL. Esta
         * é uma classe QueryWriter para RedBeanPHP. Este
         * QueryWriter fornece suporte para a plataforma
         * de banco de dados PostgreSQL.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class PostgreSQL extends AQueryWriter implements QueryWriter
        {
            /**
             * Tipos de dados.
             */

            /**
             *
             */
            const C_DATATYPE_INTEGER = 0;

            /**
             *
             */
            const C_DATATYPE_DOUBLE = 1;

            /**
             *
             */
            const C_DATATYPE_TEXT = 3;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_DATE = 80;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_DATETIME = 81;

            /**
             * TIME (sem zona) apenas manual.
             */
            const C_DATATYPE_SPECIAL_TIME = 82;

            /**
             * TIME (mais zona) apenas manual.
             */
            const C_DATATYPE_SPECIAL_TIMEZ = 83;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_POINT = 90;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_LSEG = 91;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_CIRCLE = 92;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_MONEY = 93;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_POLYGON = 94;

            /**
             * Números apenas dinheiro, ou seja, numérico de
             * ponto fixo.
             */
            const C_DATATYPE_SPECIAL_MONEY2 = 95;

            /**
             * Suporte JSON (somente manual).
             */
            const C_DATATYPE_SPECIAL_JSON = 96;

            /**
             *
             */
            const C_DATATYPE_SPECIFIED = 99;

            /**
             * @var DBAdapter.
             */
            protected $adapter;

            /**
             * @var string.
             */
            protected $quoteCharacter = '"';

            /**
             * @var string.
             */
            protected $defaultValue = "DEFAULT";

            /**
             * @var array
             */
            protected $DDLTemplates = array(
                "addColumn" => array(
                    "*" => 'ALTER TABLE %s ADD %s %s '
                ),

                "createTable" => array(
                    "*" => 'CREATE TABLE %s (id SERIAL PRIMARY KEY) '
                ),

                "widenColumn" => array(
                    "*" => 'ALTER TABLE %s ALTER COLUMN %s TYPE %s'
                )
            );

            /**
             * Retorna o snippet SQL do sufixo de inserção.
             *
             * @param  string $table Tabela.
             * @return string $sql   Trecho SQL.
             */
            protected function getInsertSuffix($table)
            {
                return "RETURNING id ";
            }

            /**
             * @see AQueryWriter::getKeyMapForType.
             */
            protected function getKeyMapForType($type)
            {
                $table = $this->esc($type, true);
                $keys = $this->adapter->get('
                    SELECT
                    information_schema.key_column_usage.constraint_name AS "name",
                    information_schema.key_column_usage.column_name AS "from",
                    information_schema.constraint_table_usage.table_name AS "table",
                    information_schema.constraint_column_usage.column_name AS "to",
                    information_schema.referential_constraints.update_rule AS "on_update",
                    information_schema.referential_constraints.delete_rule AS "on_delete"
                        FROM information_schema.key_column_usage
                    INNER JOIN information_schema.constraint_table_usage
                        ON (
                            information_schema.key_column_usage.constraint_name = information_schema.constraint_table_usage.constraint_name
                            AND information_schema.key_column_usage.constraint_schema = information_schema.constraint_table_usage.constraint_schema
                            AND information_schema.key_column_usage.constraint_catalog = information_schema.constraint_table_usage.constraint_catalog
                        )
                    INNER JOIN information_schema.constraint_column_usage
                        ON (
                            information_schema.key_column_usage.constraint_name = information_schema.constraint_column_usage.constraint_name
                            AND information_schema.key_column_usage.constraint_schema = information_schema.constraint_column_usage.constraint_schema
                            AND information_schema.key_column_usage.constraint_catalog = information_schema.constraint_column_usage.constraint_catalog
                        )
                    INNER JOIN information_schema.referential_constraints
                        ON (
                            information_schema.key_column_usage.constraint_name = information_schema.referential_constraints.constraint_name
                            AND information_schema.key_column_usage.constraint_schema = information_schema.referential_constraints.constraint_schema
                            AND information_schema.key_column_usage.constraint_catalog = information_schema.referential_constraints.constraint_catalog
                        )
                    WHERE
                        information_schema.key_column_usage.table_catalog = current_database()
                        AND information_schema.key_column_usage.table_schema = ANY( current_schemas( FALSE ) )
                        AND information_schema.key_column_usage.table_name = ?
                ', array($type));

                $keyInfoList = array();
                foreach ($keys as $k)
                {
                    $label = $this->makeFKLabel(
                        $k["from"],
                        $k["table"],
                        $k["to"]
                    );

                    $keyInfoList[$label] = array(
                        "name" => $k["name"],
                        "from" => $k["from"],
                        "table" => $k["table"],
                        "to" => $k["to"],
                        "on_update" => $k["on_update"],
                        "on_delete" => $k["on_delete"]
                    );
                }

                return $keyInfoList;
            }

            /**
             * Constructor
             * Most of the time, you do not need to use this constructor,
             * since the facade takes care of constructing and wiring the
             * RedBeanPHP core objects. However if you would like to
             * assemble an OODB instance yourself, this is how it works:
             *
             * Usage:
             *
             * <code>
             * $database = new RPDO( $dsn, $user, $pass );
             * $adapter = new DBAdapter( $database );
             * $writer = new PostgresWriter( $adapter );
             * $oodb = new OODB( $writer, false );
             * $bean = $oodb->dispense( "bean" );
             * $bean->name = "coffeeBean";
             * $id = $oodb->store( $bean );
             * $bean = $oodb->load( "bean", $id );
             * </code>
             *
             * The example above creates the 3 RedBeanPHP core objects:
             * the Adapter, the Query Writer and the OODB instance and
             * wires them together. The example also demonstrates some of
             * the methods that can be used with OODB, as you see, they
             * closely resemble their facade counterparts.
             *
             * The wiring process: create an RPDO instance using your database
             * connection parameters. Create a database adapter from the RPDO
             * object and pass that to the constructor of the writer. Next,
             * create an OODB instance from the writer. Now you have an OODB
             * object.
             *
             * @param Adapter $adapter Database Adapter
             */
            public function __construct( Adapter $adapter )
            {
                $this->typeno_sqltype = array(
                    self::C_DATATYPE_INTEGER => " integer ",
                    self::C_DATATYPE_DOUBLE => " double precision ",
                    self::C_DATATYPE_TEXT => " text ",
                    self::C_DATATYPE_SPECIAL_DATE => " date ",
                    self::C_DATATYPE_SPECIAL_TIME => " time ",
                    self::C_DATATYPE_SPECIAL_TIMEZ => " time with time zone ",
                    self::C_DATATYPE_SPECIAL_DATETIME => " timestamp without time zone ",
                    self::C_DATATYPE_SPECIAL_POINT => " point ",
                    self::C_DATATYPE_SPECIAL_LSEG => " lseg ",
                    self::C_DATATYPE_SPECIAL_CIRCLE => " circle ",
                    self::C_DATATYPE_SPECIAL_MONEY => " money ",
                    self::C_DATATYPE_SPECIAL_MONEY2 => " numeric(10,2) ",
                    self::C_DATATYPE_SPECIAL_POLYGON => " polygon ",
                    self::C_DATATYPE_SPECIAL_JSON => " json ",
                );

                $this->sqltype_typeno = array();
                foreach ($this->typeno_sqltype as $k => $v)
                {
                    $this->sqltype_typeno[
                        trim(
                            strtolower(
                                $v
                            )
                        )
                    ] = $k;
                }

                $this->adapter = $adapter;
            }

            /**
             * Este método retorna o tipo de dados a ser usado para
             * IDS de chave primária e chaves estrangeiras. Retorna
             * um se o tipo de dados for constante.
             *
             * @return integer.
             */
            public function getTypeForID()
            {
                return self::C_DATATYPE_INTEGER;
            }

            /**
             * @see QueryWriter::getTables.
             */
            public function getTables()
            {
                return $this->adapter->getCol(
                    'SELECT table_name FROM information_schema.tables WHERE table_schema = ANY( current_schemas( FALSE ) )'
                );
            }

            /**
             * @see QueryWriter::createTable.
             */
            public function createTable($type)
            {
                $table = $this->esc($type);
                $this->adapter->exec(
                    sprintf(
                        $this->getDDLTemplate(
                            "createTable",
                            $type
                        ),

                        $table
                    )
                );
            }

            /**
             * @see QueryWriter::getColumns.
             */
            public function getColumns($table)
            {
                $table = $this->esc($table, true);
                $columnsRaw = $this->adapter->get(
                    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name='$table' AND table_schema = ANY( current_schemas( FALSE ) )"
                );

                $columns = array();
                foreach ($columnsRaw as $r)
                {
                    $columns[$r["column_name"]] = $r["data_type"];
                }

                return $columns;
            }

            /**
             * @see QueryWriter::scanType.
             */
            public function scanType($value, $flagSpecial = FALSE)
            {
                if ($value === INF)
                {
                    return self::C_DATATYPE_TEXT;
                }

                if ($flagSpecial && $value)
                {
                    if (preg_match('/^\d{4}\-\d\d-\d\d$/', $value))
                    {
                        return PostgreSQL::C_DATATYPE_SPECIAL_DATE;
                    }

                    if (preg_match('/^\d{4}\-\d\d-\d\d\s\d\d:\d\d:\d\d(\.\d{1,6})?$/', $value))
                    {
                        return PostgreSQL::C_DATATYPE_SPECIAL_DATETIME;
                    }

                    if (preg_match('/^\([\d\.]+,[\d\.]+\)$/', $value))
                    {
                        return PostgreSQL::C_DATATYPE_SPECIAL_POINT;
                    }

                    if (preg_match('/^\[\([\d\.]+,[\d\.]+\),\([\d\.]+,[\d\.]+\)\]$/', $value))
                    {
                        return PostgreSQL::C_DATATYPE_SPECIAL_LSEG;
                    }

                    if (preg_match('/^\<\([\d\.]+,[\d\.]+\),[\d\.]+\>$/', $value))
                    {
                        return PostgreSQL::C_DATATYPE_SPECIAL_CIRCLE;
                    }

                    if (preg_match('/^\((\([\d\.]+,[\d\.]+\),?)+\)$/', $value))
                    {
                        return PostgreSQL::C_DATATYPE_SPECIAL_POLYGON;
                    }

                    if (preg_match('/^\-?(\$|€|¥|£)[\d,\.]+$/', $value))
                    {
                        return PostgreSQL::C_DATATYPE_SPECIAL_MONEY;
                    }

                    if (preg_match('/^-?\d+\.\d{2}$/', $value))
                    {
                        return PostgreSQL::C_DATATYPE_SPECIAL_MONEY2;
                    }

                    if (self::$flagUseJSONColumns && $this->isJSON($value))
                    {
                        return self::C_DATATYPE_SPECIAL_JSON;
                    }
                }

                if (is_float($value))
                {
                    return self::C_DATATYPE_DOUBLE;
                }

                if ($this->startsWithZeros($value))
                {
                    return self::C_DATATYPE_TEXT;
                }

                if ($value === false || $value === true || $value === NULL || (is_numeric($value) &&
                    AQueryWriter::canBeTreatedAsInt($value) &&
                    $value < 2147483648 &&
                    $value > -2147483648))
                {
                    return self::C_DATATYPE_INTEGER;
                } elseif (is_numeric($value))
                {
                    return self::C_DATATYPE_DOUBLE;
                } else
                {
                    return self::C_DATATYPE_TEXT;
                }
            }

            /**
             * @see QueryWriter::code.
             */
            public function code($typedescription, $includeSpecials = false)
            {
                $r = (
                    isset(
                        $this->sqltype_typeno[$typedescription]
                    )
                ) ? $this->sqltype_typeno[$typedescription] : 99;

                if ($includeSpecials)
                {
                    return $r;
                }

                if ($r >= QueryWriter::C_DATATYPE_RANGE_SPECIAL)
                {
                    return self::C_DATATYPE_SPECIFIED;
                }

                return $r;
            }

            /**
             * @see QueryWriter::widenColumn.
             */
            public function widenColumn($beanType, $column, $datatype)
            {
                $table = $beanType;
                $type = $datatype;

                $table = $this->esc($table);
                $column = $this->esc($column);

                $newtype = $this->typeno_sqltype[$type];
                $this->adapter->exec(
                    sprintf(
                        $this->getDDLTemplate("widenColumn", $beanType, $column),
                        $table,
                        $column,
                        $newtype
                    )
                );
            }

            /**
             * @see QueryWriter::addUniqueIndex.
             */
            public function addUniqueConstraint($type, $properties)
            {
                $tableNoQ = $this->esc($type, true);
                $columns = array();

                foreach ($properties as $key => $column)
                {
                    $columns[$key] = $this->esc($column);
                }

                /**
                 *
                 */
                $table = $this->esc($type);

                /**
                 * Caso contrário, obteremos vários índices devido
                 * aos efeitos do pedido.
                 */
                sort($columns);

                $name = "UQ_" . sha1($table . implode(",", $columns));
                $sql = "ALTER TABLE {$table}
                        ADD CONSTRAINT $name UNIQUE (" . implode( ',', $columns ) . ")";

                try
                {
                    $this->adapter->exec($sql);
                } catch(SQLException $e)
                {
                    return false;
                }

                return true;
            }

            /**
             * @see QueryWriter::sqlStateIn.
             */
            public function sqlStateIn($state, $list, $extraDriverDetails = array())
            {
                $stateMap = array(
                    "42P01" => QueryWriter::C_SQLSTATE_NO_SUCH_TABLE,
                    "42703" => QueryWriter::C_SQLSTATE_NO_SUCH_COLUMN,
                    "23505" => QueryWriter::C_SQLSTATE_INTEGRITY_CONSTRAINT_VIOLATION,
                    "55P03" => QueryWriter::C_SQLSTATE_LOCK_TIMEOUT
                );

                return in_array(
                    (
                        isset($stateMap[$state]) ? $stateMap[$state] : "0"
                    ),

                    $list
                );
            }

            /**
             * @see QueryWriter::addIndex.
             */
            public function addIndex($type, $name, $property)
            {
                $table = $this->esc($type);
                $name = preg_replace('/\W/', "", $name);
                $column = $this->esc($property);

                try
                {
                    $this->adapter->exec(
                        "CREATE INDEX {$name} ON $table ({$column}) "
                    );

                    return true;
                } catch (SQLException $e)
                {
                    return false;
                }
            }

            /**
             * @see QueryWriter::addFK.
             */
            public function addFK($type, $targetType, $property, $targetProperty, $isDep = false)
            {
                $table = $this->esc($type);
                $targetTable = $this->esc($targetType);
                $field = $this->esc($property);
                $targetField = $this->esc($targetProperty);
                $tableNoQ = $this->esc($type, true);
                $fieldNoQ = $this->esc($property, true);

                if (!is_null($this->getForeignKeyForTypeProperty($tableNoQ, $fieldNoQ)))
                {
                    return false;
                }

                try
                {
                    $delRule = ( $isDep ? "CASCADE" : "SET NULL" );
                    $this->adapter->exec("ALTER TABLE {$table}
                        ADD FOREIGN KEY ( {$field} ) REFERENCES  {$targetTable}
                        ({$targetField}) ON DELETE {$delRule} ON UPDATE {$delRule} DEFERRABLE ;"
                    );

                    return true;
                } catch (SQLException $e)
                {
                    return false;
                }
            }

            /**
             * @see QueryWriter::wipeAll.
             */
            public function wipeAll()
            {
                if (AQueryWriter::$noNuke)
                {
                    throw new \Exception(
                        "The nuke() command has been disabled using noNuke() or R::feature(novice/...)."
                    );
                }

                /**
                 *
                 */
                $this->adapter->exec(
                    "SET CONSTRAINTS ALL DEFERRED"
                );

                /**
                 *
                 */
                foreach ($this->getTables() as $t)
                {
                    $t = $this->esc($t);

                    /**
                     * Alguns plug-ins (PostGIS possuem tabelas/visualizações
                     * irremovíveis) evitam exceções.
                     */
                    try
                    {
                        $this->adapter->exec(
                            "DROP TABLE IF EXISTS $t CASCADE "
                        );
                    } catch(\Exception $e)
                    {
                    }
                }

                $this->adapter->exec(
                    "SET CONSTRAINTS ALL IMMEDIATE"
                );
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\QueryWriter
    {
        use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\Adapter\DBAdapter as DBAdapter;
        use RedBeanPHP\Adapter as Adapter;
        use RedBeanPHP\RedException\SQL as SQLException;


        /**
         * Escritor RedBeanPHP CUBRID. Esta é uma classe
         * QueryWriter para RedBeanPHP. Este QueryWriter
         * fornece suporte para a plataforma de banco de
         * dados CUBRID.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class CUBRID extends AQueryWriter implements QueryWriter
        {
            /**
             * Tipos de dados.
             */

            /**
             *
             */
            const C_DATATYPE_INTEGER = 0;

            /**
             *
             */
            const C_DATATYPE_DOUBLE = 1;

            /**
             *
             */
            const C_DATATYPE_STRING = 2;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_DATE = 80;

            /**
             *
             */
            const C_DATATYPE_SPECIAL_DATETIME = 81;

            /**
             *
             */
            const C_DATATYPE_SPECIFIED = 99;

            /**
             * @var DBAdapter.
             */
            protected $adapter;

            /**
             * @var string.
             */
            protected $quoteCharacter = "`";

            /**
             * Este método adiciona uma chave estrangeira do tipo e
             * campo ao tipo e campo de destino. A chave estrangeira
             * é criada sem ação. Ao excluir/atualizar nenhuma ação
             * será acionada. O FK é usado apenas para permitir que
             * ferramentas de banco de dados gerem diagramas bonitos
             * e para facilitar a adição de ações posteriormente.
             * Este método aceita um tipo e infere o nome da tabela
             * correspondente.
             *
             * @param  string  $type           Tipo que terá um campo de chave estrangeira.
             * @param  string  $targetType     Aponta para esse tipo.
             * @param  string  $property       Campo que contém o valor da chave estrangeira.
             * @param  string  $targetProperty Campo para onde fk aponta.
             * @param  boolean $isDep          É dependente.
             * @return bool.
             */
            protected function buildFK($type, $targetType, $property, $targetProperty, $isDep = false)
            {
                $table = $this->esc($type);
                $tableNoQ = $this->esc($type, true);
                $targetTable = $this->esc($targetType);
                $targetTableNoQ = $this->esc($targetType, true);
                $column = $this->esc($property);
                $columnNoQ = $this->esc($property, true);
                $targetColumn = $this->esc($targetProperty);

                if (!is_null($this->getForeignKeyForTypeProperty($tableNoQ, $columnNoQ)))
                {
                    return false;
                }

                $needsToDropFK = false;
                $casc = ($isDep ? "CASCADE" : "SET NULL");
                $sql = "ALTER TABLE $table ADD CONSTRAINT FOREIGN KEY($column) REFERENCES $targetTable($targetColumn) ON DELETE $casc ";

                try
                {
                    $this->adapter->exec($sql);
                } catch(SQLException $e)
                {
                    return false;
                }

                return true;
            }

            /**
             * @see AQueryWriter::getKeyMapForType.
             */
            protected function getKeyMapForType($type)
            {
                $sqlCode = $this->adapter->get(
                    "SHOW CREATE TABLE `{$type}`"
                );

                if (!isset($sqlCode[0]))
                {
                    return array();
                }

                $matches = array();
                preg_match_all('/CONSTRAINT\s+\[([\w_]+)\]\s+FOREIGN\s+KEY\s+\(\[([\w_]+)\]\)\s+REFERENCES\s+\[([\w_]+)\](\s+ON\s+DELETE\s+(CASCADE|SET\sNULL|RESTRICT|NO\sACTION)\s+ON\s+UPDATE\s+(SET\sNULL|RESTRICT|NO\sACTION))?/', $sqlCode[0]['CREATE TABLE'], $matches);

                $list = array();
                if (!isset($matches[0]))
                {
                    return $list;
                }

                $max = count($matches[0]);
                for ($i = 0; $i < $max; $i++)
                {
                    $label = $this->makeFKLabel(
                        $matches[2][$i],
                        $matches[3][$i],
                        "id"
                    );

                    /**
                     *
                     */
                    $list[$label] = array(
                        "name" => $matches[1][$i],
                        "from" => $matches[2][$i],
                        "table" => $matches[3][$i],
                        "to" => "id",
                        "on_update" => $matches[6][$i],
                        "on_delete" => $matches[5][$i]
                    );
                }

                return $list;
            }

            /**
             * Construtor:
             * Na maioria das vezes, você não precisa usar esse
             * construtor, pois a fachada se encarrega de construir
             * e conectar os objetos principais do RedBeanPHP. No
             * entanto, se você quiser montar uma instância OODB
             * sozinho, é assim que funciona:
             *
             * Uso:
             *     <code>
             *         $database = new RPDO($dsn, $user, $pass);
             *         $adapter = new DBAdapter($database);
             *         $writer = new PostgresWriter($adapter);
             *         $oodb = new OODB($writer, false);
             *
             *         $bean = $oodb->dispense("bean");
             *         $bean->name = "coffeeBean";
             *
             *         $id = $oodb->store($bean);
             *         $bean = $oodb->load("bean", $id);
             *     </code>
             *
             * O exemplo acima cria os 3 objetos principais do RedBeanPHP:
             * o Adaptador, o Query Writer e a instância OODB e os conecta.
             * O exemplo também demonstra alguns dos métodos que podem ser
             * usados com OODB, como você pode ver, eles se assemelham muito
             * aos seus equivalentes de fachada.
             *
             * O processo de ligação: crie uma instância RPDO usando os
             * parâmetros de conexão do banco de dados. Crie um adaptador
             * de banco de dados a partir do objeto RPDO e passe-o para o
             * construtor do gravador. Em seguida, crie uma instância OODB
             * do gravador. Agora você tem um objeto OODB.
             *
             * @param Adapter $adapter Adaptador de banco de dados.
             */
            public function __construct(Adapter $adapter)
            {
                $this->typeno_sqltype = array(
                    CUBRID::C_DATATYPE_INTEGER => " INTEGER ",
                    CUBRID::C_DATATYPE_DOUBLE => " DOUBLE ",
                    CUBRID::C_DATATYPE_STRING => " STRING ",
                    CUBRID::C_DATATYPE_SPECIAL_DATE => " DATE ",
                    CUBRID::C_DATATYPE_SPECIAL_DATETIME => " DATETIME ",
                );

                $this->sqltype_typeno = array();
                foreach ($this->typeno_sqltype as $k => $v)
                {
                    $this->sqltype_typeno[
                        trim(($v))
                    ] = $k;
                }

                $this->sqltype_typeno["STRING(1073741823)"] = self::C_DATATYPE_STRING;
                $this->adapter = $adapter;
            }

            /**
             * Este método retorna o tipo de dados a ser usado para
             * IDS de chave primária e chaves estrangeiras. Retorna
             * um se o tipo de dados for constante.
             *
             * @return integer.
             */
            public function getTypeForID()
            {
                return self::C_DATATYPE_INTEGER;
            }

            /**
             * @see QueryWriter::getTables.
             */
            public function getTables()
            {
                $rows = $this->adapter->getCol(
                    "SELECT class_name FROM db_class WHERE is_system_class = 'NO';"
                );

                return $rows;
            }

            /**
             * @see QueryWriter::createTable.
             */
            public function createTable($table)
            {
                $sql  = 'CREATE TABLE '
                    . $this->esc($table)
                    . ' ("id" integer AUTO_INCREMENT, CONSTRAINT "pk_'
                    . $this->esc($table, true)
                    . '_id" PRIMARY KEY("id"))';

                $this->adapter->exec($sql);
            }

            /**
             * @see QueryWriter::getColumns.
             */
            public function getColumns($table)
            {
                $table = $this->esc($table);
                $columnsRaw = $this->adapter->get(
                    "SHOW COLUMNS FROM $table"
                );

                $columns = array();
                foreach ($columnsRaw as $r)
                {
                    $columns[$r["Field"]] = $r["Type"];
                }

                return $columns;
            }

            /**
             * @see QueryWriter::scanType.
             */
            public function scanType($value, $flagSpecial = false)
            {
                if (is_null($value))
                {
                    return self::C_DATATYPE_INTEGER;
                }

                if ($flagSpecial)
                {
                    if (preg_match('/^\d{4}\-\d\d-\d\d$/', $value))
                    {
                        return self::C_DATATYPE_SPECIAL_DATE;
                    }

                    if (preg_match('/^\d{4}\-\d\d-\d\d\s\d\d:\d\d:\d\d$/', $value))
                    {
                        return self::C_DATATYPE_SPECIAL_DATETIME;
                    }
                }

                $value = strval($value);
                if (!$this->startsWithZeros($value))
                {
                    if (is_numeric($value) && (floor($value) == $value) && $value >= -2147483647 && $value <= 2147483647)
                    {
                        return self::C_DATATYPE_INTEGER;
                    }

                    if (is_numeric($value))
                    {
                        return self::C_DATATYPE_DOUBLE;
                    }
                }

                return self::C_DATATYPE_STRING;
            }

            /**
             * @see QueryWriter::code.
             */
            public function code($typedescription, $includeSpecials = false)
            {
                $r = (
                    (
                        isset(
                            $this->sqltype_typeno[$typedescription]
                        )
                    ) ? $this->sqltype_typeno[$typedescription] : self::C_DATATYPE_SPECIFIED
                );

                if ($includeSpecials)
                {
                    return $r;
                }

                if ($r >= QueryWriter::C_DATATYPE_RANGE_SPECIAL)
                {
                    return self::C_DATATYPE_SPECIFIED;
                }

                return $r;
            }

            /**
             * @see QueryWriter::addColumn.
             */
            public function addColumn($type, $column, $field)
            {
                $table = $type;
                $type = $field;

                $table  = $this->esc($table);
                $column = $this->esc($column);
                $type   = array_key_exists(
                    $type,
                    $this->typeno_sqltype
                ) ? $this->typeno_sqltype[$type] : "";

                $this->adapter->exec(
                    "ALTER TABLE $table ADD COLUMN $column $type "
                );
            }

            /**
             * @see QueryWriter::addUniqueIndex.
             */
            public function addUniqueConstraint($type, $properties)
            {
                $tableNoQ = $this->esc($type, true);
                $columns = array();

                /**
                 *
                 */
                foreach($properties as $key => $column)
                {
                    $columns[$key] = $this->esc($column);
                }

                /**
                 *
                 */
                $table = $this->esc($type);

                /**
                 * Caso contrário, obteremos vários índices devido aos
                 * efeitos do pedido.
                 */
                sort($columns);

                /**
                 *
                 */
                $name = "UQ_" . sha1(
                    implode(
                        ",",
                        $columns
                    )
                );

                /**
                 *
                 */
                $sql = "ALTER TABLE $table ADD CONSTRAINT UNIQUE $name (" . implode( ",", $columns ) . ")";

                /**
                 *
                 */
                try
                {
                    $this->adapter->exec($sql);
                } catch(SQLException $e)
                {
                    return false;
                }

                return true;
            }

            /**
             * @see QueryWriter::sqlStateIn.
             */
            public function sqlStateIn($state, $list, $extraDriverDetails = array())
            {
                return ($state == "HY000") ? (
                    count(
                        array_diff(
                            array(
                                QueryWriter::C_SQLSTATE_INTEGRITY_CONSTRAINT_VIOLATION,
                                QueryWriter::C_SQLSTATE_NO_SUCH_COLUMN,
                                QueryWriter::C_SQLSTATE_NO_SUCH_TABLE
                            ),
                            $list
                        )
                    ) !== 3
                ) : false;
            }

            /**
             * @see QueryWriter::addIndex.
             */
            public function addIndex($type, $name, $column)
            {
                try
                {
                    $table = $this->esc($type);
                    $name = preg_replace('/\W/', "", $name);
                    $column = $this->esc($column);
                    $this->adapter->exec(
                        "CREATE INDEX $name ON $table ($column) "
                    );

                    return true;
                } catch (SQLException $e)
                {
                    return false;
                }
            }

            /**
             * @see QueryWriter::addFK.
             */
            public function addFK($type, $targetType, $property, $targetProperty, $isDependent = false)
            {
                return $this->buildFK(
                    $type,
                    $targetType,
                    $property,
                    $targetProperty,
                    $isDependent
                );
            }

            /**
             * @see QueryWriter::wipeAll.
             */
            public function wipeAll()
            {
                if (AQueryWriter::$noNuke)
                {
                    throw new \Exception(
                        "The nuke() command has been disabled using noNuke() or R::feature(novice/...)."
                    );
                }

                foreach ($this->getTables() as $t)
                {
                    foreach ($this->getKeyMapForType( $t ) as $k)
                    {
                        $this->adapter->exec(
                            "ALTER TABLE \"$t\" DROP FOREIGN KEY \"{$k['name']}\""
                        );
                    }
                }

                foreach ($this->getTables() as $t)
                {
                    $this->adapter->exec(
                        "DROP TABLE \"$t\""
                    );
                }
            }

            /**
             * @see QueryWriter::esc.
             */
            public function esc($dbStructure, $noQuotes = false)
            {
                return parent::esc(
                    strtolower(
                        $dbStructure
                    ),

                    $noQuotes
                );
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        /**
         * Base RedBean\Exception.
         * Representa a classe base para RedBeanPHP\Exceptions.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class RedException extends \Exception
        {
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\RedException
    {
        use RedBeanPHP\RedException as RedException;


        /**
         * Exceção SQL.
         * Representa uma exceção genérica de banco de dados
         * independente do driver subjacente.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class SQL extends RedException
        {
            /**
             * @var string.
             */
            private $sqlState;

            /**
             * @var array.
             */
            private $driverDetails = array();

            /**
             * @return array.
             */
            public function getDriverDetails()
            {
                return $this->driverDetails;
            }

            /**
             * @param array $driverDetails.
             * @return void.
             */
            public function setDriverDetails($driverDetails)
            {
                $this->driverDetails = $driverDetails;
            }

            /**
             * Retorna um estado SQL compatível com ANSI-92.
             *
             * @return string.
             */
            public function getSQLState()
            {
                return $this->sqlState;
            }

            /**
             * Retorna o SQL STATE bruto, possivelmente compatível com
             * códigos de erro SQL ANSI - mas isso depende do driver
             * do banco de dados.
             *
             * @param string $sqlState Código de erro de estado SQL.
             * @return void.
             */
            public function setSQLState($sqlState)
            {
                $this->sqlState = $sqlState;
            }

            /**
             * To String imprime o código e o estado SQL.
             *
             * @return string.
             */
            public function __toString()
            {
                return "[" . $this->getSQLState() . "] - " . $this->getMessage()."\n".
                    "trace: " . $this->getTraceAsString();
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\Adapter\DBAdapter as DBAdapter;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\BeanHelper as BeanHelper;
        use RedBeanPHP\RedException\SQL as SQLException;
        use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;
        use RedBeanPHP\Cursor as Cursor;
        use RedBeanPHP\Cursor\NullCursor as NullCursor;


        /**
         * Repositório Abstrato.
         *
         * OODB gerencia dois repositórios, um fluido que ajusta
         * o esquema do banco de dados dinamicamente para acomodar
         * novos tipos de bean (tabelas) e novas propriedades (colunas)
         * e um congelado para uso em um ambiente de produção. OODB
         * permite trocar as instâncias do repositório usando o
         * método freeze().
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        abstract class Repository
        {
            /**
             * @var array.
             */
            protected $stash = NULL;

            /**
             * @var integer.
             */
            protected $nesting = 0;

            /**
             * @var QueryWriter.
             */
            protected $writer;

            /**
             * @var boolean|array.
             */
            protected $partialBeans = false;

            /**
             * @var OODB.
             */
            public $oodb = NULL;

            /**
             * Alterna o "modo de bean parcial". Se este modo tiver
             * sido selecionado, o repositório atualizará apenas os
             * campos de um bean que foi alterado, e não o bean
             * inteiro. Passe o valor true para selecionar "modo parcial"
             * para todos os beans. Passe o valor false para desabilitar
             * o "modo parcial". Passe um array de tipos de bean se
             * desejar usar o modo parcial apenas para alguns tipos.
             * Este método retornará o valor anterior.
             *
             * @param boolean|array $yesNoBeans Lista de nomes de tipos ou "todos".
             * @return boolean|array.
             */
            public function usePartialBeans($yesNoBeans)
            {
                $oldValue = $this->partialBeans;
                $this->partialBeans = $yesNoBeans;

                return $oldValue;
            }

            /**
             * Fully processes a bean and updates the associated records in the database.
             * First the bean properties will be grouped as "embedded" bean,
             * addition, deleted "trash can" or residue. Next, the different groups
             * of beans will be processed accordingly and the reference bean (i.e.
             * the one that was passed to the method as an argument) will be stored.
             * Each type of list (own/shared) has 3 bean processors: 
             *
             * - trashCanProcessor : removes the bean or breaks its association with the current bean
             * - additionProcessor : associates the bean with the current one
             * - residueProcessor  : manages beans in lists that "remain" but may need to be updated
             * 
             * This method first groups the beans and then calls the
             * internal processing methods.
             *
             * @param OODBBean $bean bean to process
             *
             * @return void
             */
            protected function storeBeanWithLists(OODBBean $bean)
            {
                /**
                 * Definir grupos.
                 */
                $sharedAdditions = $sharedTrashcan
                    = $sharedresidue
                    = $sharedItems
                    = $ownAdditions
                    = $ownTrashcan
                    = $ownresidue
                    = $embeddedBeans
                    = array();

                foreach ($bean as $property => $value)
                {
                    $value = (
                        $value instanceof SimpleModel
                    ) ? $value->unbox() : $value;

                    if ($value instanceof OODBBean)
                    {
                        $this->processEmbeddedBean(
                            $embeddedBeans,
                            $bean,
                            $property,
                            $value
                        );

                        $bean->setMeta("sys.typeof.{$property}", $value->getMeta("type"));
                    } elseif (is_array($value))
                    {
                        foreach ($value as &$item)
                        {
                            $item = (
                                $item instanceof SimpleModel
                            ) ? $item->unbox() : $item;
                        }

                        $originals = $bean->moveMeta( "sys.shadow." . $property, array() );
                        if (strpos($property, "own") === 0)
                        {
                            list(
                                $ownAdditions,
                                $ownTrashcan,
                                $ownresidue
                            ) = $this->processGroups(
                                $originals,
                                $value,
                                $ownAdditions,
                                $ownTrashcan,
                                $ownresidue
                            );

                            $listName = lcfirst(substr($property, 3));
                            if ($bean->moveMeta("sys.exclusive-".  $listName))
                            {
                                OODBBean::setMetaAll($ownTrashcan, "sys.garbage", true);
                                OODBBean::setMetaAll($ownAdditions, "sys.buildcommand.fkdependson", $bean->getMeta("type"));
                            }

                            unset($bean->$property);
                        } elseif (strpos($property, "shared") === 0)
                        {
                            list(
                                $sharedAdditions,
                                $sharedTrashcan,
                                $sharedresidue
                            ) = $this->processGroups(
                                $originals,
                                $value,
                                $sharedAdditions,
                                $sharedTrashcan,
                                $sharedresidue
                            );

                            unset($bean->$property);
                        }
                    }
                }

                $this->storeBean($bean);
                $this->processTrashcan($bean, $ownTrashcan);
                $this->processAdditions($bean, $ownAdditions);
                $this->processResidue($ownresidue);
                $this->processSharedTrashcan($bean, $sharedTrashcan);
                $this->processSharedAdditions($bean, $sharedAdditions);
                $this->processSharedResidue($bean, $sharedresidue);
            }

            /**
             * Process groups. Internal function. Processes different kind of groups for
             * storage function. Given a list of original beans and a list of current beans,
             * this function calculates which beans remain in the list (residue), which
             * have been deleted (are in the trashcan) and which beans have been added
             * (additions).
             *
             * @param  array $originals originals
             * @param  array $current   the current beans
             * @param  array $additions beans that have been added
             * @param  array $trashcan  beans that have been deleted
             * @param  array $residue   beans that have been left untouched
             *
             * @return array
             */
            protected function processGroups( $originals, $current, $additions, $trashcan, $residue )
            {
                return array(
                    array_merge($additions, array_diff($current, $originals)),
                    array_merge($trashcan, array_diff($originals, $current)),
                    array_merge($residue, array_intersect($current, $originals))
                );
            }

            /**
             * Processa uma lista de beans de um bean. Um bean pode
             * conter listas. Este método lida com listas de adição
             * compartilhadas; ou seja, as propriedades $bean->sharedObject.
             * Os beans compartilhados serão associados entre si
             * usando o Association Manager.
             *
             * @param OODBBean $bean            O bean.
             * @param array    $sharedAdditions Lista com adições compartilhadas
             *
             * @return void
             */
            protected function processSharedAdditions($bean, $sharedAdditions)
            {
                foreach ($sharedAdditions as $addition)
                {
                    if ($addition instanceof OODBBean)
                    {
                        $this
                            ->oodb
                            ->getAssociationManager()
                            ->associate($addition, $bean);
                    } else
                    {
                        throw new RedException(
                            "Array may only contain OODBBeans"
                        );
                    }
                }
            }

            /**
             * Processa uma lista de beans de um bean. Um bean pode
             * conter listas. Este método lida com listas próprias;
             * ou seja, as propriedades $bean->ownObject. Um
             * resíduo é um bean em uma lista própria que permanece
             * onde está. Este método verifica se houve alguma
             * modificação neste bean, nesse caso o bean é armazenado
             * novamente, caso contrário o bean permanecerá intacto.
             *
             * @param array $ownresidue lista para processar.
             * @return void.
             */
            protected function processResidue($ownresidue)
            {
                foreach ($ownresidue as $residue)
                {
                    if ($residue->getMeta("tainted"))
                    {
                        $this->store($residue);
                    }
                }
            }

            /**
             * Processa uma lista de beans de um bean. Um bean pode
             * conter listas. Este método lida com listas próprias;
             * ou seja, as propriedades $bean->ownObject. Um bean
             * de lata de lixo é um bean em uma lista própria que
             * foi removido (quando verificado com a sombra). Este
             * método verifica se o bean também está na lista de
             * dependências. Se for, o bean será removido. Caso
             * contrário, a conexão entre o bean e o bean
             * proprietário será interrompida ao definir o ID como
             * NULL.
             *
             * @param OODBBean $bean bean   Processar.
             * @param array    $ownTrashcan Lista para processar.
             * @return void.
             */
            protected function processTrashcan($bean, $ownTrashcan)
            {
                foreach ($ownTrashcan as $trash)
                {
                    $myFieldLink = $bean->getMeta("type") . "_id";
                    $alias = $bean->getMeta("sys.alias." . $trash->getMeta("type"));

                    if ($alias)
                    {
                        $myFieldLink = $alias . "_id";
                    }

                    if ($trash->getMeta("sys.garbage") === true)
                    {
                        $this->trash($trash);
                    } else
                    {
                        $trash->$myFieldLink = NULL;
                        $this->store($trash);
                    }
                }
            }

            /**
             * Desassocia os itens da lista na lixeira. Este processador
             * de beans processa os beans na lixeira compartilhada. Este
             * grupo de beans foi excluído de uma lista compartilhada. Os
             * beans afetados não estarão mais associados ao bean que
             * contém a lista compartilhada.
             *
             * @param OODBBean  $bean            Bean para processar.
             * @param array     $sharedTrashcan  Lista para processar.
             * @return void.
             */
            protected function processSharedTrashcan($bean, $sharedTrashcan)
            {
                foreach ($sharedTrashcan as $trash)
                {
                    $this
                        ->oodb
                        ->getAssociationManager()
                        ->unassociate(
                            $trash,
                            $bean
                        );
                }
            }

            /**
             * Armazena todos os beans no grupo de resíduos. Este
             * processador de beans processa os beans no grupo de
             * resíduos compartilhados. Este grupo de beans "permanece"
             * na lista, mas pode precisar ser atualizado ou sincronizado.
             * Os beans afetados serão armazenados para executar as
             * consultas necessárias ao banco de dados.
             *
             * @param OODBBean $bean          Bean para processar.
             * @param array    $sharedresidue Lista para processar.
             *
             * @return void
             */
            protected function processSharedResidue($bean, $sharedresidue)
            {
                foreach ($sharedresidue as $residue)
                {
                    $this->store($residue);
                }
            }

            /**
             * Determina se o bean possui "listas carregadas"
             * ou "bean incorporados carregados" que precisam
             * ser processados pelo método store().
             * 
             * @param OODBBean $bean bean a ser examinado.
             * @return boolean.
             */
            protected function hasListsOrObjects(OODBBean $bean)
            {
                $processLists = false;
                foreach ($bean as $value)
                {
                    if (is_array($value) || is_object($value))
                    {
                        $processLists = true;
                        break;
                    }
                }

                return $processLists;
            }

            /**
             * Converte um bean incorporado em um ID, remove a
             * propriedade do bean e armazena o bean no vetor
             * de beans incorporados. O id será atribuído à
             * propriedade do campo de link, ou seja, "bean_id".
             *
             * @param array    $embeddedBeans Vetor de destino para bean incorporado.
             * @param OODBBean $bean          Bean alvo para processar.
             * @param string   $property      Propriedade que contém o bean incorporado.
             * @param OODBBean $value         Próprio bean embutido.
             * @return void.
             */
            protected function processEmbeddedBean(&$embeddedBeans, $bean, $property, OODBBean $value)
            {
                $linkField = $property . "_id";
                if (!$value->id || $value->getMeta("tainted"))
                {
                    $this->store($value);
                }

                $id = $value->id;
                if ($bean->$linkField != $id)
                {
                    $bean->$linkField = $id;
                }

                $bean->setMeta("cast." . $linkField, "id");
                $embeddedBeans[$linkField] = $value;
                unset($bean->$property);
            }

            /**
             * Construtor, requer um gravador de consulta e OODB.
             * Cria uma nova instância da classe de repositório
             * de bean.
             *
             * @param OODB        $oodb   Instância do banco de dados de objetos.
             * @param QueryWriter $writer O Query Writer a ser usado para este repositório
             * @return void.
             */
            public function __construct(OODB $oodb, QueryWriter $writer)
            {
                $this->writer = $writer;
                $this->oodb = $oodb;
            }

            /**
             * Verifica se um bean OODBBean é válido. Se o tipo ou
             * o ID não for válido, será lançada uma exceção: Segurança.
             * Para ser válido um bean deve obedecer às seguintes regras:
             *     - Deve ter uma propriedade de chave primária chamada: id.
             *     - Deve ter um tipo.
             *     - O tipo deve estar em conformidade com a política de
             *       nomenclatura RedBeanPHP
             *     - Todas as propriedades devem ser válidas.
             *     - Todos os valores devem ser válidos.
             *
             * @param OODBBean $bean O bean que precisa ser verificado.
             * @return void.
             */
            public function check( OODBBean $bean )
            {
                /**
                 * Todas as metainformações estão presentes ?
                 */
                if (!isset($bean->id))
                {
                    throw new RedException(
                        "Bean has incomplete Meta Information id "
                    );
                }

                if (!( $bean->getMeta("type")))
                {
                    throw new RedException(
                        "Bean has incomplete Meta Information II"
                    );
                }

                /**
                 * Padrão de caracteres permitidos.
                 */
                $pattern = '/[^a-z0-9_]/i';

                /**
                 * O tipo contém caracteres inválidos ?
                 */
                if (preg_match($pattern, $bean->getMeta("type")))
                {
                    throw new RedException(
                        "Bean Type is invalid"
                    );
                }

                /**
                 * As propriedades e valores são válidos ?
                 */
                foreach ($bean as $prop => $value)
                {
                    if (is_array($value) || (is_object($value)))
                    {
                        throw new RedException(
                            "Invalid Bean value: property $prop"
                        );
                    } else if (strlen( $prop ) < 1 || preg_match($pattern, $prop))
                    {
                        throw new RedException(
                            "Invalid Bean property: property $prop"
                        );
                    }
                }
            }

            /**
             * Dispenses a new bean (a OODBBean Bean Object)
             * of the specified type. Always
             * use this function to get an empty bean object. Never
             * instantiate a OODBBean yourself because it needs
             * to be configured before you can use it with RedBean. This
             * function applies the appropriate initialization /
             * configuration for you.
             *
             * To use a different class for beans (instead of OODBBean) set:
             * REDBEAN_OODBBEAN_CLASS to the name of the class to be used.
             *
             * @param string  $type              type of bean you want to dispense
             * @param int     $number            number of beans you would like to get
             * @param boolean $alwaysReturnArray if true always returns the result as an array
             *
             * @return OODBBean|OODBBean[]
             */
            public function dispense($type, $number = 1, $alwaysReturnArray = false)
            {
                $OODBBEAN = defined(
                    "REDBEAN_OODBBEAN_CLASS"
                ) ? REDBEAN_OODBBEAN_CLASS : "\RedBeanPHP\OODBBean";

                $beans = array();
                for ($i = 0; $i < $number; $i++)
                {
                    $bean = new $OODBBEAN;
                    $bean->initializeForDispense(
                        $type,
                        $this->oodb->getBeanHelper()
                    );

                    $this->check($bean);
                    $this->oodb->signal("dispense", $bean);
                    $beans[] = $bean;
                }

                return (
                    count(
                        $beans
                    ) === 1 && !$alwaysReturnArray
                ) ? array_pop($beans) : $beans;
            }

            /**
             * Pesquisa no banco de dados um bean que corresponda
             * às condições $conditions e sql $addSQL e retorna um
             * array contendo todos os beans que foram encontrados.
             *
             * As condições precisam tomar a forma:
             *     <code>
             *         array(
             *             "PROPERTY" => array(POSSIBLE VALUES... "John", "Steve")
             *             "PROPERTY" => array(POSSIBLE VALUES...)
             *         );
             *     </code>
             *
             * Todas as condições são coladas usando o operador AND,
             * enquanto todas as listas de valores são coladas usando
             * operadores IN, agindo assim como condições OR.
             *
             * Observe que você pode usar nomes de propriedades; as
             * colunas serão extraídas usando o formatador de bean
             * apropriado.
             *
             * @param string $type       Tipo de bean que você procura.
             * @param array  $conditions Lista de condições.
             * @param string $sql        SQL a ser usado na consulta.
             * @param array  $bindings   Se você prefere usar uma cláusula
             *                           WHERE ou não (true = not).
             * @return array.
             */
            public function find($type, $conditions = array(), $sql = NULL, $bindings = array())
            {
                /**
                 * Para compatibilidade com versões anteriores, permita
                 * argumentos de incompatibilidade:
                 */
                if (is_array($sql))
                {
                    if (isset($sql[1]))
                    {
                        $bindings = $sql[1];
                    }

                    $sql = $sql[0];
                }

                try
                {
                    $beans = $this->convertToBeans(
                        $type,
                        $this->writer->queryRecord(
                            $type,
                            $conditions,
                            $sql,
                            $bindings
                        )
                    );

                    return $beans;
                } catch (SQLException $exception)
                {
                    $this->handleException($exception);
                }

                return array();
            }

            /**
             * Encontra um BeanCollection.
             * Dado um tipo, um snippet SQL e opcionalmente algumas
             * ligações de parâmetros, este método retorna um
             * BeanCollection para sua consulta.
             *
             * O BeanCollection representa uma coleção de beans e
             * possibilita o uso de cursores de banco de dados. O
             * BeanCollection possui um método next() para obter o
             * primeiro, o próximo e o último bean da coleção. O
             * BeanCollection não implementa a interface de array
             * nem tenta agir como um array porque não pode
             * retroceder ou retroceder.
             *
             * @param string $type     Tipo de bean que você procura.
             * @param string $sql      SQL a ser usado na consulta.
             * @param array  $bindings Se você prefere usar uma cláusula WHERE
             *                         ou não (true = not).
             * @return BeanCollection.
             */
            public function findCollection( $type, $sql, $bindings = array() )
            {
                try
                {
                    $cursor = $this
                        ->writer
                        ->queryRecordWithCursor(
                            $type,
                            $sql,
                            $bindings
                        );

                    return new BeanCollection(
                        $type,
                        $this,
                        $cursor
                    );
                } catch (SQLException $exception)
                {
                    $this->handleException($exception);
                }

                return new BeanCollection($type, $this, new NullCursor);
            }

            /**
             * Stores a bean in the database. This method takes a
             * OODBBean Bean Object $bean and stores it
             * in the database. If the database schema is not compatible
             * with this bean and RedBean runs in fluid mode the schema
             * will be altered to store the bean correctly.
             * If the database schema is not compatible with this bean and
             * RedBean runs in frozen mode it will throw an exception.
             * This function returns the primary key ID of the inserted
             * bean.
             *
             * The return value is an integer if possible. If it is not possible to
             * represent the value as an integer a string will be returned. We use
             * explicit casts instead of functions to preserve performance
             * (0.13 vs 0.28 for 10000 iterations on Core i3).
             *
             * @param OODBBean|SimpleModel $bean bean to store
             *
             * @return integer|string
             */
            public function store( $bean )
            {
                $processLists = $this
                    ->hasListsOrObjects($bean);

                if (!$processLists && !$bean->getMeta("tainted"))
                {
                    /**
                     * Resgate !
                     */
                    return $bean->getID();
                }

                $this->oodb->signal( "update", $bean );

                /**
                 * Verifique novamente, pode ter mudado de modelo !
                 */
                $processLists = $this->hasListsOrObjects($bean);

                if ($processLists)
                {
                    $this->storeBeanWithLists($bean);
                } else
                {
                    $this->storeBean($bean);
                }

                $this->oodb->signal("after_update", $bean);

                return (
                    (string) $bean->id === (string) (int) $bean->id
                ) ? (int) $bean->id : (string) $bean->id;
            }

            /**
             * Retorna um vetor de beans. Passe um tipo e uma série
             * de ids e este método lhe trará os beans correspondentes.
             * 
             * Observação importante: como este método carrega beans
             * usando a função load() (mas mais rápido), ele retornará
             * beans vazios com ID 0 para cada bean que não pôde ser
             * localizado. Os beans resultantes terão os IDs passados
             * como chaves.
             *
             * @param string $type Tipo de beans.
             * @param array  $ids  ids para load.
             * @return array.
             */
            public function batch($type, $ids)
            {
                if (!$ids)
                {
                    return array();
                }

                /**
                 *
                 */
                $collection = array();

                try
                {
                    $rows = $this->writer->queryRecord(
                        $type,
                        array(
                            "id" => $ids
                        )
                    );
                } catch (SQLException $e)
                {
                    $this->handleException($e);
                    $rows = false;
                }

                /**
                 *
                 */
                $this->stash[$this->nesting] = array();

                /**
                 *
                 */
                if (!$rows)
                {
                    return array();
                }

                /**
                 *
                 */
                foreach ($rows as $row)
                {
                    $this->stash[$this->nesting][$row["id"]] = $row;
                }

                /**
                 *
                 */
                foreach ($ids as $id)
                {
                    $collection[$id] = $this->load(
                        $type,
                        $id
                    );
                }

                /**
                 *
                 */
                $this->stash[$this->nesting] = NULL;

                /**
                 *
                 */
                return $collection;
            }

            /**
             * Este é um método conveniente; ele converte linhas do
             * banco de dados (vetores) em beans. Dado um tipo e um
             * conjunto de linhas, este método retornará um array de
             * beans do tipo especificado carregado com os campos de
             * dados fornecidos pelo conjunto de resultados do banco
             * de dados.
             *
             * Novo no 4.3.2: metamáscara. A metamáscara é uma máscara
             * especial para enviar dados das linhas de resultados
             * brutos para o metastore do bean. Isso é útil para agrupar
             * informações adicionais com consultas personalizadas. Os
             * valores de cada coluna cujo nome começa com $mask serão
             * transferidos para a metaseção do bean na
             * chave "data.bundle".
             *
             * @param string $type Tipo de bean que você gostaria de comer.
             * @param array  $rows Linhas do resultado do banco de dados.
             * @param string $mask Meta máscara a ser aplicada (opcional).
             * @return array.
             */
            public function convertToBeans($type, $rows, $mask = "__meta")
            {
                $masktype = gettype($mask);

                /**
                 *
                 */
                switch ($masktype)
                {
                    case "string":
                        break;

                    case "array":
                        $maskflip = array();
                        foreach ($mask as $m)
                        {
                            if (!is_string($m))
                            {
                                $mask = NULL;
                                $masktype = "NULL";
                                break 2;
                            }

                            $maskflip[$m] = true;
                        }

                        $mask = $maskflip;
                        break;

                    default:
                        $mask = NULL;
                        $masktype = "NULL";
                }

                /**
                 *
                 */
                $collection = array();
                $this->stash[$this->nesting] = array();

                /**
                 *
                 */
                foreach ($rows as $row)
                {
                    if ($mask !== NULL)
                    {
                        $meta = array();
                        foreach($row as $key => $value)
                        {
                            if ($masktype === "string")
                            {
                                if (strpos($key, $mask) === 0)
                                {
                                    unset($row[$key]);
                                    $meta[$key] = $value;
                                }
                            } elseif ($masktype === "array")
                            {
                                if (isset($mask[$key]))
                                {
                                    unset($row[$key]);
                                    $meta[$key] = $value;
                                }
                            }
                        }
                    }

                    $id = $row["id"];
                    $this->stash[$this->nesting][$id] = $row;
                    $collection[$id] = $this->load($type, $id);

                    if ($mask !== NULL)
                    {
                        $collection[$id]->setMeta("data.bundle", $meta);
                    }
                }

                /**
                 *
                 */
                $this->stash[$this->nesting] = NULL;

                /**
                 *
                 */
                return $collection;
            }

            /**
             * Conta o número de beans do tipo $type. Este método aceita
             * um segundo argumento para modificar a consulta de contador.
             * Um terceiro argumento pode ser usado para fornecer ligações
             * para o snippet SQL.
             *
             * @param string $type     Tipo de bean que procuramos.
             * @param string $addSQL   Trecho SQL adicional.
             * @param array  $bindings Parâmetros para vincular ao SQL.
             * @return integer.
             */
            public function count($type, $addSQL = "", $bindings = array())
            {
                $type = AQueryWriter::camelsSnake($type);

                try
                {
                    $count = (int) $this->writer->queryRecordCount($type, array(), $addSQL, $bindings);
                } catch (SQLException $exception)
                {
                    $this->handleException( $exception );
                    $count = 0;
                }

                return $count;
            }

            /**
             * Remove um bean do banco de dados. Esta função removerá
             * o objeto Bean OODBBean especificado do banco de dados.
             *
             * @param OODBBean|SimpleModel $bean bean que você deseja remover
             *                                   do banco de dados.
             * @return int
             */
            public function trash($bean)
            {
                $this->oodb->signal("delete", $bean);
                foreach ($bean as $property => $value)
                {
                    if ($value instanceof OODBBean)
                    {
                        unset($bean->$property);
                    }

                    if (is_array($value))
                    {
                        if (strpos($property, "own") === 0)
                        {
                            unset($bean->$property);
                        } elseif (strpos($property, "shared") === 0)
                        {
                            unset($bean->$property);
                        }
                    }
                }

                try
                {
                    $deleted = $this->writer->deleteRecord(
                        $bean->getMeta("type"),
                        array(
                            "id" => array(
                                $bean->id
                            )
                        )
                    );
                } catch (SQLException $exception)
                {
                    $this->handleException($exception);
                }

                $bean->id = 0;
                $this->oodb->signal("after_delete", $bean);

                return isset($deleted) ? $deleted : 0;
            }

            /**
             * Verifica se a tabela especificada já existe no
             * banco de dados. Não faz parte da interface do
             * banco de dados de objetos !
             *
             * @param string $table Nome da tabela.
             * @return boolean.
             */
            public function tableExists($table)
            {
                return $this->writer->tableExists($table);
            }

            /**
             * Jogue no lixo todos os beans de um determinado tipo.
             * Limpa um tipo inteiro de bean. Após esta operação não
             * restará nenhum bean do tipo especificado. Este método
             * irá ignorar exceções causadas por tabelas de banco de
             * dados que não existem.
             *
             * @param string $type Tipo de bean do qual você deseja excluir
             *                     todas as instâncias.
             * @return boolean.
             */
            public function wipe($type)
            {
                try
                {
                    $this->writer->wipe($type);

                    return true;
                } catch (SQLException $exception)
                {
                    if (!$this->writer->sqlStateIn($exception->getSQLState(), array(QueryWriter::C_SQLSTATE_NO_SUCH_TABLE), $exception->getDriverDetails()))
                    {
                        throw $exception;
                    }

                    return false;
                }
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\Repository
    {
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\RedException as RedException;
        use RedBeanPHP\BeanHelper as BeanHelper;
        use RedBeanPHP\RedException\SQL as SQLException;
        use RedBeanPHP\Repository as Repository;


        /**
         * Repositório de Fluidos.
         * OODB gerencia dois repositórios, um fluido que ajusta o
         * esquema do banco de dados dinamicamente para acomodar
         * novos tipos de bean (tabelas) e novas propriedades
         * (colunas) e um congelado para uso em um ambiente de
         * produção. OODB permite trocar as instâncias do
         * repositório usando o método freeze().
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Fluid extends Repository
        {
            /**
             * Descobre o tipo desejado de acordo com o ID da string
             * de conversão. Dado um ID de conversão, este método
             * retornará o tipo associado (INT(10) ou VARCHAR por
             * exemplo). O tipo retornado pode ser processado pelo
             * Query Writer para construir a coluna especificada para
             * você no banco de dados. O Cast ID é, na verdade, apenas
             * um superconjunto dos tipos QueryWriter. Além dos tipos
             * de coluna padrão do Query Writer, você pode passar os
             * seguintes "tipos de conversão": "id" e "string". Eles
             * serão mapeados para tipos de colunas específicos do
             * Query Writer (provavelmente INT e VARCHAR).
             *
             * @param string $cast Identificador de elenco.
             * @return integer.
             */
            private function getTypeFromCast($cast)
            {
                if ($cast == "string")
                {
                    $typeno = $this->writer->scanType("STRING");
                } elseif ($cast == "id")
                {
                    $typeno = $this->writer->getTypeForID();
                } elseif (isset($this->writer->sqltype_typeno[$cast]))
                {
                    $typeno = $this->writer->sqltype_typeno[$cast];
                } else
                {
                    throw new RedException(
                        "Invalid Cast"
                    );
                }

                return $typeno;
            }

            /**
             * Ordena que o Query Writer crie uma tabela se ela ainda
             * não existir e adiciona uma nota no relatório de construção
             * sobre a criação.
             *
             * @param OODBBean $bean  Bean para atualizar o relatório.
             * @param string   $table Tabela para verificar e criar se não existir.
             * @return void.
             */
            private function createTableIfNotExists(OODBBean $bean, $table)
            {
                /**
                 * A tabela existe ? Se não, crie.
                 */
                if (!$this->tableExists($this->writer->esc($table, true)))
                {
                    $this->writer->createTable($table);
                    $bean->setMeta("buildreport.flags.created", true);
                }
            }

            /**
             * Modifica a tabela para ajustar os dados do bean. Dada
             * uma propriedade, um valor e o bean, este método ajustará
             * a estrutura da tabela para atender aos requisitos da
             * propriedade e do valor. Isso pode incluir adicionar uma
             * nova coluna ou ampliar uma coluna existente para conter
             * um tipo de valor maior ou diferente. Este método emprega
             * o gravador para ajustar a estrutura da tabela no banco de
             * dados. As atualizações do esquema são registradas nas
             * metapropriedades do bean.
             *
             * Este método também aplicará índices, restrições exclusivas
             * e chaves estrangeiras.
             *
             * @param OODBBean   $bean     Bean para obter dados de conversão
             *                             e armazenar meta.
             * @param string     $property Imóvel para guardar.
             * @param mixed      $value    Valor para store.
             * @param array|NULL &$columns.
             * @return void.
             */
            private function modifySchema(OODBBean $bean, $property, $value, &$columns = NULL)
            {
                $doFKStuff = false;
                $table = $bean->getMeta("type");
                if ($columns === NULL)
                {
                    $columns = $this->writer->getColumns(
                        $table
                    );
                }

                /**
                 *
                 */
                $columnNoQ = $this->writer->esc(
                    $property,
                    true
                );

                /**
                 *
                 */
                if (!$this->oodb->isChilled($bean->getMeta("type")))
                {
                    if ($bean->getMeta("cast.$property", -1) !== -1)
                    {
                        /**
                         * Verifique se há tipos explicitamente especificados.
                         */
                        $cast = $bean->getMeta("cast.$property");
                        $typeno = $this->getTypeFromCast($cast);
                    } else
                    {
                        $cast = false;
                        $typeno = $this->writer->scanType($value, true);
                    }

                    if (isset($columns[$this->writer->esc($property, true)]))
                    {
                        /**
                         * Esta propriedade está representada na tabela ?
                         */
                        if (!$cast)
                        {
                            /**
                             * Digitalizar novamente sem levar em conta tipos
                             * especiais > 80.
                             */
                            $typeno = $this->writer->scanType($value, false);
                        }

                        /**
                         *
                         */
                        $sqlt = $this->writer->code(
                            $columns[
                                $this->writer->esc(
                                    $property,
                                    true
                                )
                            ]
                        );

                        /**
                         *
                         */
                        if ($typeno > $sqlt)
                        {
                            /**
                             * Não, temos que ampliar o tipo de coluna do
                             * banco de dados.
                             */
                            $this->writer->widenColumn($table, $property, $typeno);
                            $bean->setMeta("buildreport.flags.widen", true);
                            $doFKStuff = true;
                        }
                    } else
                    {
                        $this->writer->addColumn($table, $property, $typeno);
                        $bean->setMeta("buildreport.flags.addcolumn", true);
                        $doFKStuff = true;
                    }

                    if ($doFKStuff)
                    {
                        if (strrpos($columnNoQ, "_id")===(strlen($columnNoQ) - 3))
                        {
                            $destinationColumnNoQ = substr($columnNoQ, 0, strlen($columnNoQ) - 3);
                            $indexName = "index_foreignkey_{$table}_{$destinationColumnNoQ}";
                            $this->writer->addIndex($table, $indexName, $columnNoQ);
                            $typeof = $bean->getMeta("sys.typeof.{$destinationColumnNoQ}", $destinationColumnNoQ);

                            /**
                             *
                             */
                            $isLink = $bean->getMeta("sys.buildcommand.unique", false);

                            /**
                             * Faça FK CASCADING se fizer parte da lista
                             * exclusiva (dependson=typeof) ou se for link bean.
                             */
                            $isDep = (
                                $bean->moveMeta(
                                    "sys.buildcommand.fkdependson"
                                ) === $typeof || is_array($isLink)
                            );

                            /**
                             *
                             */
                            $result = $this
                                ->writer
                                ->addFK(
                                    $table,
                                    $typeof,
                                    $columnNoQ, "id",
                                    $isDep
                                );

                            /**
                             * Se este for um link bean e todas as colunas
                             * exclusivas já tiverem sido adicionadas,
                             * aplique a restrição exclusiva.
                             */
                            if (is_array($isLink) && !count(array_diff($isLink, array_keys($this->writer->getColumns($table)))))
                            {
                                $this->writer->addUniqueConstraint(
                                    $table,
                                    $bean->moveMeta("sys.buildcommand.unique")
                                );

                                $bean->setMeta("sys.typeof.{$destinationColumnNoQ}", NULL);
                            }
                        }
                    }
                }
            }

            /**
             * Parte da funcionalidade store(). Lida com todas as
             * novas adições após o bean ter sido salvo. Armazena
             * o bean adicional na lista própria, extrai o id e
             * adiciona uma chave estrangeira. Também adiciona
             * uma restrição caso o tipo esteja na lista de
             * dependentes.
             *
             * Observe que este método gera uma exceção customizada
             * se o bean não for uma instância de OODBBean. Portanto,
             * ele não usa uma dica de tipo. Isso permite que o usuário
             * tome medidas caso objetos inválidos sejam passados na
             * lista.
             *
             * @param OODBBean $bean         Bean para processar.
             * @param array    $ownAdditions Lista de beans de adição na lista própria.
             * @return void.
             */
            protected function processAdditions($bean, $ownAdditions)
            {
                $beanType = $bean->getMeta("type");
                foreach ($ownAdditions as $addition)
                {
                    if ($addition instanceof OODBBean)
                    {
                        $myFieldLink = $beanType . "_id";
                        $alias = $bean->getMeta("sys.alias." . $addition->getMeta("type"));

                        if ($alias)
                        {
                            $myFieldLink = $alias . "_id";
                        }

                        $addition->$myFieldLink = $bean->id;
                        $addition->setMeta("cast." . $myFieldLink, "id");

                        if ($alias)
                        {
                            $addition->setMeta("sys.typeof.{$alias}", $beanType);
                        } else
                        {
                            $addition->setMeta("sys.typeof.{$beanType}", $beanType);
                        }

                        $this->store($addition);
                    } else
                    {
                        throw new RedException(
                            "Array may only contain OODBBeans"
                        );
                    }
                }
            }

            /**
             * Armazena um bean limpo; ou seja, apenas valores escalares.
             * Este é o núcleo do método store(). Quando todas as listas
             * e beans incorporados (objetos pai) foram processados e
             * removidos do bean original, o bean é passado para este
             * método para ser armazenado no banco de dados.
             *
             * @param OODBBean $bean o bean limpo.
             * @return void.
             */
            protected function storeBean(OODBBean $bean)
            {
                if ($bean->getMeta("changed"))
                {
                    $this->check($bean);
                    $table = $bean->getMeta("type");
                    $this->createTableIfNotExists($bean, $table);
                    $updateValues = array();

                    /**
                     *
                     */
                    $partial = (
                        $this->partialBeans === true || (
                            is_array(
                                $this->partialBeans
                            ) && in_array($table, $this->partialBeans)
                        )
                    );

                    if ($partial)
                    {
                        $mask = $bean->getMeta("changelist");
                        $bean->setMeta("changelist", array());
                    }

                    $columnCache = NULL;
                    foreach ($bean as $property => $value)
                    {
                        if ($partial && !in_array($property, $mask))
                        {
                            continue;
                        }

                        if ($property !== "id")
                        {
                            $this->modifySchema(
                                $bean,
                                $property,
                                $value,
                                $columnCache
                            );
                        }

                        if ($property !== "id")
                        {
                            $updateValues[] = array(
                                "property" => $property,
                                "value" => $value
                            );
                        }
                    }

                    $bean->id = $this->writer->updateRecord($table, $updateValues, $bean->id);
                    $bean->setMeta("changed", false);
                }

                $bean->setMeta("tainted", false);
            }

            /**
             * Manipulador de exceções. Os modos Fluid e Frozen têm
             * maneiras diferentes de lidar com exceções. O modo
             * fluido (usando o repositório fluido) ignora exceções
             * causadas pelo seguinte:
             *     - Tabelas faltantes.
             *     - Coluna faltante.
             *
             * Nessas situações, o repositório se comportará como se
             * nenhum bean pudesse ser encontrado. Isso ocorre porque
             * no modo fluido pode acontecer de consultar uma tabela
             * ou coluna que ainda não foi criada. No modo congelado,
             * isso não deveria acontecer e as exceções correspondentes
             * serão lançadas.
             *
             * @param \Exception $exception exception.
             * @return void.
             */
            protected function handleException(\Exception $exception)
            {
                if (!$this->writer->sqlStateIn($exception->getSQLState(), array(QueryWriter::C_SQLSTATE_NO_SUCH_TABLE, QueryWriter::C_SQLSTATE_NO_SUCH_COLUMN), $exception->getDriverDetails()))
                {
                    throw $exception;
                }
            }

            /**
             * Carrega um bean do banco de dados de objetos. Ele procura
             * um objeto Bean OODBBean no banco de dados. Não importa como
             * este bean foi armazenado. RedBean usa o ID da chave primária
             * $id e a string $type para encontrar o bean. O $type especifica
             * que tipo de bean você está procurando; este é o mesmo tipo
             * usado com a função dispense(). Se o RedBean encontrar o bean,
             * ele retornará o objeto OODB Bean; se não conseguir encontrar
             * o bean, o RedBean retornará um novo bean do tipo $type e com
             * ID de chave primária 0. Neste último caso, ele atua basicamente
             * da mesma forma que dispense().
             *
             * Nota importante:
             * Se o bean não puder ser encontrado no banco de dados,
             * um novo bean do tipo especificado será gerado e
             * retornado.
             *
             * @param string  $type Tipo de bean que você deseja carregar.
             * @param integer $id   ID do bean que você deseja carregar.
             * @return OODBBean.
             */
            public function load($type, $id)
            {
                $rows = array();
                $bean = $this->dispense($type);

                if (isset($this->stash[$this->nesting][$id]))
                {
                    $row = $this->stash[$this->nesting][$id];
                } else
                {
                    try
                    {
                        $rows = $this->writer->queryRecord(
                            $type,
                            array(
                                "id" => array($id)
                            )
                        );
                    } catch (SQLException $exception)
                    {
                        if ($this->writer->sqlStateIn($exception->getSQLState(), array(QueryWriter::C_SQLSTATE_NO_SUCH_COLUMN, QueryWriter::C_SQLSTATE_NO_SUCH_TABLE), $exception->getDriverDetails()))
                        {
                            $rows = array();
                        } else
                        {
                            throw $exception;
                        }
                    }

                    if (!count($rows))
                    {
                        return $bean;
                    }

                    $row = array_pop($rows);
                }

                $bean->importRow($row);
                $this->nesting++;
                $this->oodb->signal("open", $bean);
                $this->nesting--;

                /**
                 *
                 */
                return $bean->setMeta("tainted", false);
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\Repository
    {
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\RedException as RedException;
        use RedBeanPHP\BeanHelper as BeanHelper;
        use RedBeanPHP\RedException\SQL as SQLException;
        use RedBeanPHP\Repository as Repository;


        /**
         * Frozen Repository.
         * OODB manages two repositories, a fluid one that
         * adjust the database schema on-the-fly to accommodate for
         * new bean types (tables) and new properties (columns) and
         * a frozen one for use in a production environment. OODB
         * allows you to swap the repository instances using the freeze()
         * method.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Frozen extends Repository
        {
            /**
             * Manipulador de exceções. Os modos Fluid e Frozen têm
             * maneiras diferentes de lidar com exceções. O modo
             * fluido (usando o repositório fluido) ignora
             * exceções causadas pelo seguinte:
             *     - Tabelas faltantes.
             *     - Coluna faltante.
             *
             * Nessas situações, o repositório se comportará como se
             * nenhum bean pudesse ser encontrado. Isso ocorre porque
             * no modo fluido pode acontecer de consultar uma tabela
             * ou coluna que ainda não foi criada. No modo congelado,
             * isso não deveria acontecer e as exceções correspondentes
             * serão lançadas.
             *
             * @param \Exception $exception exceção.
             * @return void.
             */
            protected function handleException(\Exception $exception)
            {
                throw $exception;
            }

            /**
             * Armazena um bean limpo; ou seja, apenas valores
             * escalares. Este é o núcleo do método store().
             * Quando todas as listas e beans incorporados (objetos
             * pai) foram processados e removidos do bean original,
             * o bean é passado para este método para ser armazenado
             * no banco de dados.
             *
             * @param OODBBean $bean o bean limpo.
             * @return void.
             */
            protected function storeBean(OODBBean $bean)
            {
                if ($bean->getMeta("changed"))
                {
                    list(
                        $properties,
                        $table
                    ) = $bean->getPropertiesAndType();

                    /**
                     *
                     */
                    $id = $properties["id"];
                    unset($properties["id"]);

                    /**
                     *
                     */
                    $updateValues = array();
                    $k1 = "property";
                    $k2 = "value";

                    /**
                     *
                     */
                    $partial = (
                        $this->partialBeans === true || (
                            is_array(
                                $this->partialBeans
                            ) && in_array(
                                $table,
                                $this->partialBeans
                            )
                        )
                    );

                    /**
                     *
                     */
                    if ($partial)
                    {
                        $mask = $bean->getMeta("changelist");
                        $bean->setMeta("changelist", array());
                    }

                    foreach ($properties as $key => $value)
                    {
                        if ($partial && !in_array($key, $mask))
                        {
                            continue;
                        }

                        $updateValues[] = array(
                            $k1 => $key,
                            $k2 => $value
                        );
                    }

                    $bean->id = $this->writer->updateRecord($table, $updateValues, $id);
                    $bean->setMeta("changed", false);
                }

                $bean->setMeta("tainted", false);
            }

            /**
             * Parte da funcionalidade store(). Lida com todas as
             * novas adições após o bean ter sido salvo. Armazena
             * o bean adicional na lista própria, extrai o id e
             * adiciona uma chave estrangeira. Também adiciona
             * uma restrição caso o tipo esteja na lista de
             * dependentes.
             *
             * Observe que este método gera uma exceção customizada
             * se o bean não for uma instância de OODBBean. Portanto,
             * ele não usa uma dica de tipo. Isso permite que o
             * usuário tome medidas caso objetos inválidos sejam
             * passados na lista.
             *
             * @param OODBBean $bean         Bean para processar.
             * @param array    $ownAdditions Lista de beans de adição na lista própria.
             *
             * @return void.
             * @throws RedException.
             */
            protected function processAdditions($bean, $ownAdditions)
            {
                $beanType = $bean->getMeta("type");
                $cachedIndex = array();

                foreach ($ownAdditions as $addition)
                {
                    if ($addition instanceof OODBBean)
                    {
                        $myFieldLink = $beanType . "_id";
                        $alias = $bean->getMeta("sys.alias." . $addition->getMeta("type"));

                        if ($alias)
                        {
                            $myFieldLink = $alias . "_id";
                        }

                        $addition->$myFieldLink = $bean->id;
                        $addition->setMeta("cast." . $myFieldLink, "id");
                        $this->store( $addition );
                    } else
                    {
                        throw new RedException(
                            "Array may only contain OODBBeans"
                        );
                    }
                }
            }

            /**
             * Carrega um bean do banco de dados de objetos. Ele procura
             * um objeto Bean OODBBean no banco de dados. Não importa
             * como este bean foi armazenado. RedBean usa o ID da chave
             * primária $id e a string $type para encontrar o bean. O
             * $type especifica que tipo de bean você está procurando;
             * este é o mesmo tipo usado com a função dispense(). Se o
             * RedBean encontrar o bean, ele retornará o objeto Bean
             * OODB; se não conseguir encontrar o bean, o RedBean
             * retornará um novo bean do tipo $type e com ID de chave
             * primária 0. Neste último caso, ele atua basicamente da
             * mesma forma que dispense().
             *
             * Observação importante: Se o bean não puder ser encontrado
             * no banco de dados, um novo bean do tipo especificado será
             * gerado e retornado.
             *
             * @param string  $type Tipo de feijão que você deseja carregar.
             * @param integer $id   ID do bean que você deseja carregar.
             *
             * @return OODBBean.
             * @throws SQLException.
             */
            public function load($type, $id)
            {
                $rows = array();
                $bean = $this->dispense($type);

                if (isset($this->stash[$this->nesting][$id]))
                {
                    $row = $this->stash[$this->nesting][$id];
                } else
                {
                    $rows = $this->writer->queryRecord(
                        $type,
                        array(
                            "id" => array(
                                $id
                            )
                        )
                    );

                    if (!count($rows))
                    {
                        return $bean;
                    }

                    $row = array_pop($rows);
                }

                $bean->importRow($row);
                $this->nesting++;
                $this->oodb->signal("open", $bean);
                $this->nesting--;

                return $bean->setMeta("tainted", false);
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\Adapter\DBAdapter as DBAdapter;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\BeanHelper as BeanHelper;
        use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;
        use RedBeanPHP\Repository as Repository;
        use RedBeanPHP\Repository\Fluid as FluidRepo;
        use RedBeanPHP\Repository\Frozen as FrozenRepo;


        /**
         * Banco de dados orientado a objetos RedBean.
         *
         * A classe RedBean OODB é a classe principal do
         * RedBeanPHP. Ele pega objetos OODBBean, armazena-os
         * e carrega-os do banco de dados, além de fornecer
         * outras funções CRUD. Esta classe atua como um banco
         * de dados de objetos.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class OODB extends Observable
        {
            /**
             * @var array.
             */
            private static $sqlFilters = array();

            /**
             * @var array.
             */
            protected $chillList = array();

            /**
             * @var array.
             */
            protected $stash = NULL;

            /**
             * @var integer.
             */
            protected $nesting = 0;

            /**
             * @var QueryWriter.
             */
            protected $writer;

            /**
             * @var boolean.
             */
            protected $isFrozen = false;

            /**
             * @var BeanHelper|NULL.
             */
            protected $beanhelper = NULL;

            /**
             * @var AssociationManager|NULL.
             */
            protected $assocManager = NULL;

            /**
             * @var Repository.
             */
            protected $repository = NULL;

            /**
             * @var FrozenRepo|NULL.
             */
            protected $frozenRepository = NULL;

            /**
             * @var FluidRepo|NULL.
             */
            protected $fluidRepository = NULL;

            /**
             * @var boolean.
             */
            protected static $autoClearHistoryAfterStore = false;

            /**
             * Se definido como true, este método chamará clearHistory
             * toda vez que o bean for armazenado.
             *
             * @param boolean $autoClear opção de limpeza automática.
             * @return void.
             */
            public static function autoClearHistoryAfterStore($autoClear = true)
            {
                self::$autoClearHistoryAfterStore = (boolean) $autoClear;
            }

            /**
             * Desembala um bean de um modelo FUSE, se necessário,
             * e verifica se o bean é uma instância de OODBBean.
             *
             * @param OODBBean|SimpleModel $bean bean que você deseja desempacotar.
             * @return OODBBean.
             */
            protected function unboxIfNeeded($bean)
            {
                if ($bean instanceof SimpleModel)
                {
                    $bean = $bean->unbox();
                }

                if (!($bean instanceof OODBBean))
                {
                    throw new RedException(
                        "OODB Store requires a bean, got: " . gettype($bean)
                    );
                }

                return $bean;
            }

            /**
             * Construtor, requer um escritor de consultas. Na
             * maioria das vezes, você não precisa usar esse
             * construtor, pois a fachada se encarrega de
             * construir e conectar os objetos principais do
             * RedBeanPHP. No entanto, se você quiser montar
             * uma instância OODB sozinho, é assim que
             * funciona:
             *
             * Uso:
             *     <code>
             *         $database = new RPDO($dsn, $user, $pass);
             *         $adapter = new DBAdapter($database);
             *         $writer = new PostgresWriter($adapter);
             *         $oodb = new OODB($writer, false);
             *
             *         $bean = $oodb->dispense("bean");
             *         $bean->name = "coffeeBean";
             *
             *         $id = $oodb->store($bean);
             *         $bean = $oodb->load("bean", $id);
             *     </code>
             *
             * O exemplo acima cria os 3 objetos principais do
             * RedBeanPHP: o Adaptador, o Query Writer e a
             * instância OODB e os conecta. O exemplo também
             * demonstra alguns dos métodos que podem ser
             * usados com OODB, como você pode ver, eles se
             * assemelham muito aos seus equivalentes de
             * fachada.
             *
             * O processo de ligação: crie uma instância RPDO
             * usando os parâmetros de conexão do banco de
             * dados. Crie um adaptador de banco de dados a
             * partir do objeto RPDO e passe-o para o construtor
             * do gravador. Em seguida, crie uma instância OODB
             * do gravador. Agora você tem um objeto OODB.
             *
             * @param QueryWriter   $writer Escritor.
             * @param array|boolean $frozen Modo de operação:
             *                              true (frozen),
             *                              false (default, fluid) ou
             *                              ARRAY (refrigerado).
             */
            public function __construct(QueryWriter $writer, $frozen = false)
            {
                if ($writer instanceof QueryWriter)
                {
                    $this->writer = $writer;
                }

                $this->freeze($frozen);
            }

            /**
             * Alterna o modo fluido ou congelado. No modo fluido,
             * a estrutura do banco de dados é ajustada para acomodar
             * seus objetos. No modo congelado, este não é o caso.
             *
             * Você também pode passar um array contendo uma seleção
             * de tipos congelados. Vamos chamar isso de modo frio,
             * é como o modo fluido, exceto que certos tipos (ou
             * seja, tabelas) não são tocados.
             *
             * @param boolean|array $toggle true se você quiser usar a
             *                              instância OODB no modo congelado.
             * @return void.
             */
            public function freeze($toggle)
            {
                if (is_array($toggle))
                {
                    $this->chillList = $toggle;
                    $this->isFrozen = false;
                } else
                {
                    $this->isFrozen = (boolean) $toggle;
                }

                if ($this->isFrozen)
                {
                    if (!$this->frozenRepository)
                    {
                        $this->frozenRepository = new FrozenRepo(
                            $this,
                            $this->writer
                        );
                    }

                    $this->repository = $this->frozenRepository;
                } else
                {
                    if (!$this->fluidRepository)
                    {
                        $this->fluidRepository = new FluidRepo(
                            $this,
                            $this->writer
                        );
                    }

                    $this->repository = $this->fluidRepository;
                }

                if (count(self::$sqlFilters))
                {
                    AQueryWriter::setSQLFilters(
                        self::$sqlFilters,
                        (
                            !$this->isFrozen
                        )
                    );
                }
            }

            /**
             * Retorna o modo atual de operação do RedBean. No modo
             * fluido, a estrutura do banco de dados é ajustada para
             * acomodar seus objetos. No modo congelado, este não é
             * o caso.
             *
             * @return boolean.
             */
            public function isFrozen()
            {
                return (bool) $this->isFrozen;
            }

            /**
             * Determina se um tipo está na lista de resfriamento.
             * Se um tipo estiver "refrigerado", ele estará congelado,
             * portanto seu esquema não poderá mais ser alterado. No
             * entanto, outros tipos de bean ainda podem ser modificados.
             * Este método é um método conveniente para outros objetos
             * verificarem se o esquema de um determinado tipo está
             * bloqueado para modificação.
             *
             * @param string $type o tipo que você deseja verificar.
             * @return boolean.
             */
            public function isChilled($type)
            {
                return (boolean) (in_array($type, $this->chillList));
            }

            /**
             * Distribui um novo bean (um objeto Bean OODBBean) do
             * tipo especificado. Sempre use esta função para obter
             * um objeto bean vazio. Nunca instancie um OODBBean
             * porque ele precisa ser configurado antes de poder
             * usá-lo com o RedBean. Esta função aplica a
             * inicialização/configuração apropriada para
             * você.
             *
             * @param string  $type              Tipo de bean que você deseja dispensar.
             * @param string  $number            Número de beans que você gostaria de obter.
             * @param boolean $alwaysReturnArray Se true sempre retorna o resultado como um array.
             * @return OODBBean|OODBBean[].
             */
            public function dispense($type, $number = 1, $alwaysReturnArray = false)
            {
                if ($number < 1)
                {
                    if ($alwaysReturnArray)
                    {
                        return array();
                    }

                    return NULL;
                }

                return $this->repository->dispense(
                    $type,
                    $number,
                    $alwaysReturnArray
                );
            }

            /**
             * Define o auxiliar de bean a ser dado aos beans.
             * Os ajudantes do Bean ajudam os beans a obter uma
             * referência para uma caixa de ferramentas.
             *
             * @param BeanHelper $beanhelper Ajudante.
             * @return void.
             */
            public function setBeanHelper(BeanHelper $beanhelper)
            {
                $this->beanhelper = $beanhelper;
            }

            /**
             * Retorna o bean helper atual. Os ajudantes do Bean
             * ajudam os beans a obter uma referência para uma
             * caixa de ferramentas.
             *
             * @return BeanHelper|NULL.
             */
            public function getBeanHelper()
            {
                return $this->beanhelper;
            }

            /**
             * Verifica se um bean OODBBean é válido. Se o tipo
             * ou o ID não for válido, será lançada uma exceção:
             * Segurança.
             *
             * @param OODBBean $bean o bean que precisa ser verificado.
             * @return void.
             */
            public function check(OODBBean $bean)
            {
                $this->repository->check($bean);
            }

            /**
             * Pesquisa no banco de dados um bean que corresponda
             * às condições $conditions e sql $sql e retorna um
             * array contendo todos os beans que foram encontrados.
             *
             * As condições precisam tomar a forma:
             *     <code>
             *         array(
             *             "PROPERTY" => array(POSSIBLE VALUES... "John", "Steve")
             *             "PROPERTY" => array(POSSIBLE VALUES...)
             *         );
             *     </code>
             *
             * Todas as condições são coladas usando o operador AND,
             * enquanto todas as listas de valores são coladas usando
             * operadores IN, agindo assim como condições OR. Observe
             * que você pode usar nomes de propriedades; as colunas
             * serão extraídas usando o formatador de bean
             * apropriado.
             *
             * @param string      $type       Tipo de bean que você procura.
             * @param array       $conditions Lista de condições.
             * @param string|NULL $sql        SQL a ser usado na consulta.
             * @param array       $bindings   Uma lista de valores para vincular
             *                                aos parâmetros de consulta.
             * @return array.
             */
            public function find($type, $conditions = array(), $sql = NULL, $bindings = array())
            {
                return $this->repository->find(
                    $type,
                    $conditions,
                    $sql,
                    $bindings
                );
            }

            /**
             * O mesmo que find() mas retorna um BeanCollection.
             *
             * @param string      $type     Tipo de bean que você procura.
             * @param string|NULL $sql      SQL a ser usado na consulta.
             * @param array       $bindings Uma lista de valores para vincular
             *                              aos parâmetros de consulta.
             * @return BeanCollection.
             */
            public function findCollection($type, $sql = NULL, $bindings = array())
            {
                return $this->repository->findCollection(
                    $type,
                    $sql,
                    $bindings
                );
            }

            /**
             * Verifica se a tabela especificada já existe no banco
             * de dados.
             *
             * @param string $table Nome da tabela.
             * @return boolean.
             */
            public function tableExists($table)
            {
                return $this
                    ->repository
                    ->tableExists($table);
            }

            /**
             * Armazena um bean no banco de dados. Este método pega um
             * OODBBean Bean Object $bean e o armazena no banco de dados.
             * Se o esquema do banco de dados não for compatível com este
             * bean e o RedBean for executado em modo fluido, o esquema
             * será alterado para armazenar o bean corretamente. Se o
             * esquema do banco de dados não for compatível com este bean
             * e o RedBean for executado no modo congelado, ele lançará
             * uma exceção. Esta função retorna o ID da chave primária
             * do bean inserido.
             *
             * O valor de retorno é um número inteiro, se possível. Caso
             * não seja possível representar o valor como um número inteiro,
             * uma string será retornada. Usamos conversões explícitas em
             * vez de funções para preservar o desempenho (0,13 vs 0,28
             * para 10.000 iterações no Core i3).
             *
             * @param OODBBean|SimpleModel $bean bean para armazenar.
             * @return integer|string.
             */
            public function store($bean)
            {
                $bean = $this->unboxIfNeeded($bean);
                $id = $this->repository->store($bean);

                if (self::$autoClearHistoryAfterStore)
                {
                    $bean->clearHistory();
                }

                return $id;
            }

            /**
             * Carrega um bean do banco de dados de objetos. Ele procura
             * um objeto Bean OODBBean no banco de dados. Não importa como
             * este bean foi armazenado. RedBean usa o ID da chave primária
             * $id e a string $type para encontrar o bean. O $type especifica
             * que tipo de bean você está procurando; este é o mesmo tipo
             * usado com a função dispense(). Se o RedBean encontrar o bean,
             * ele retornará o objeto Bean OODB; se não conseguir encontrar
             * o bean, o RedBean retornará um novo bean do tipo $type e com
             * ID de chave primária 0. Neste último caso, ele atua basicamente
             * da mesma forma que dispense().
             *
             * Observação importante:
             * Se o bean não puder ser encontrado no banco de dados,
             * um novo bean do tipo especificado será gerado e
             * retornado.
             *
             * @param string  $type  Tipo de bean que você deseja carregar.
             * @param integer $id    ID do bean que você deseja carregar.
             * @return OODBBean.
             */
            public function load($type, $id)
            {
                return $this->repository->load($type, $id);
            }

            /**
             * Remove um bean do banco de dados. Esta função
             * removerá o objeto Bean OODBBean especificado
             * do banco de dados.
             *
             * @param OODBBean|SimpleModel $bean bean que você deseja remover
             *                                   do banco de dados.
             * @return int.
             */
            public function trash($bean)
            {
                $bean = $this->unboxIfNeeded($bean);

                return $this->repository->trash($bean);
            }

            /**
             * Retorna um vetor de beans. Passe um tipo e uma série
             * de ids e este método lhe trará os beans correspondentes.
             *
             * Observação importante: como este método carrega beans
             * usando a função load() (mas mais rápido), ele retornará
             * beans vazios com ID 0 para cada bean que não pôde ser
             * localizado. Os beans resultantes terão os IDs passados
             * como chaves.
             *
             * @param string $type Tipo de beans.
             * @param array  $ids  Ids para load.
             * @return array.
             */
            public function batch($type, $ids)
            {
                return $this->repository->batch($type, $ids);
            }

            /**
             * Este é um método conveniente; ele converte linhas do
             * banco de dados (vetores) em beans. Dado um tipo e um
             * conjunto de linhas, este método retornará um array de
             * beans do tipo especificado carregado com os campos de
             * dados fornecidos pelo conjunto de resultados do banco
             * de dados.
             *
             * @param string $type Tipo de bean que você gostaria de comer.
             * @param array  $rows Linhas do resultado do banco de dados.
             * @param string $mask Máscara para solicitar metadados.
             * @return array.
             */
            public function convertToBeans($type, $rows, $mask = NULL)
            {
                return $this->repository->convertToBeans(
                    $type,
                    $rows,
                    $mask
                );
            }

            /**
             * Conta o número de beans do tipo $type. Este método
             * aceita um segundo argumento para modificar a consulta
             * de contador. Um terceiro argumento pode ser usado
             * para fornecer ligações para o snippet SQL.
             *
             * @param string $type     Tipo de bean que procuramos.
             * @param string $addSQL   Trecho SQL adicional.
             * @param array  $bindings Parâmetros para vincular ao SQL.
             * @return integer.
             */
            public function count($type, $addSQL = "", $bindings = array())
            {
                return $this->repository->count(
                    $type,
                    $addSQL,
                    $bindings
                );
            }

            /**
             * Jogue no lixo todos os beans de um determinado tipo.
             * Limpa um tipo inteiro de bean.
             *
             * @param string $type Tipo de bean do qual você deseja excluir
             *                     todas as instâncias.
             * @return boolean.
             */
            public function wipe($type)
            {
                return $this->repository->wipe($type);
            }

            /**
             * Retorna um Association Manager para uso com OODB.
             * Uma função getter simples para obter uma referência
             * ao gerenciador de associação usado para armazenamento
             * e muito mais.
             *
             * @return AssociationManager.
             */
            public function getAssociationManager()
            {
                if (!isset($this->assocManager))
                {
                    throw new RedException(
                        "No association manager available."
                    );
                }

                return $this->assocManager;
            }

            /**
             * Define a instância do gerenciador de associação a
             * ser usada por este OODB. Uma função setter simples
             * para definir o gerenciador de associação a ser
             * usado para armazenamento e muito mais.
             *
             * @param AssociationManager $assocManager Define o gerenciador de
             *                                         associação a ser usado.
             * @return void.
             */
            public function setAssociationManager(AssociationManager $assocManager)
            {
                $this->assocManager = $assocManager;
            }

            /**
             * Retorna a instância do repositório usada atualmente.
             * Apenas para fins de teste.
             *
             * @return Repository.
             */
            public function getCurrentRepository()
            {
                return $this->repository;
            }

            /**
             * Limpa todas as ligações de funções.
             *
             * @return void.
             */
            public function clearAllFuncBindings()
            {
                self::$sqlFilters = array();
                AQueryWriter::setSQLFilters(
                    self::$sqlFilters,
                    false
                );
            }

            /**
             * Vincula uma função SQL a uma coluna. Este método pode
             * ser usado para configurar um esquema de decodificação/codificação
             * ou realizar a inserção de UUID. Este método é especialmente
             * útil para lidar com colunas espaciais MySQL, porque elas
             * precisam ser processadas primeiro usando as funções
             * asText/GeomFromText.
             *
             * @param string       $mode       Modo para definir a função, ou
             *                                 seja, ler ou escrever.
             * @param string       $field      Campo (table.column) ao qual
             *                                 vincular a função SQL.
             * @param string|NULL  $function   Função SQL para vincular ao campo.
             * @param boolean      $isTemplate true se $function for uma string
             *                                 SQL, false apenas para o nome de
             *                                 uma função.
             * @return void.
             */
            public function bindFunc($mode, $field, $function, $isTemplate = false)
            {
                list(
                    $type,
                    $property
                ) = explode(".", $field);

                /**
                 *
                 */
                $mode = ($mode === "write") ? QueryWriter::C_SQLFILTER_WRITE : QueryWriter::C_SQLFILTER_READ;

                /**
                 *
                 */
                if (!isset(self::$sqlFilters[$mode]))
                {
                    self::$sqlFilters[$mode] = array();
                }

                /**
                 *
                 */
                if (!isset(self::$sqlFilters[$mode][$type]))
                {
                    self::$sqlFilters[$mode][$type] = array();
                }

                if (is_null($function))
                {
                    unset(self::$sqlFilters[$mode][$type][$property]);
                } else
                {
                    if ($mode === QueryWriter::C_SQLFILTER_WRITE)
                    {
                        if ($isTemplate)
                        {
                            $code = sprintf( $function, "?" );
                        } else
                        {
                            $code = "{$function}(?)";
                        }

                        self::$sqlFilters[$mode][$type][$property] = $code;
                    } else
                    {
                        if ($isTemplate)
                        {
                            $code = sprintf($function, $field);
                        } else
                        {
                            $code = "{$function}({$field})";
                        }

                        self::$sqlFilters[$mode][$type][$property] = $code;
                    }
                }

                /**
                 *
                 */
                AQueryWriter::setSQLFilters(self::$sqlFilters, (!$this->isFrozen));
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\Adapter\DBAdapter as DBAdapter;
        use RedBeanPHP\Adapter as Adapter;


        /**
         * ToolBox. A caixa de ferramentas é parte integrante do
         * RedBeanPHP, fornecendo os blocos de construção
         * arquitetônicos básicos para gerenciar objetos, auxiliares
         * e ferramentas adicionais como plug-ins. Uma caixa de
         * ferramentas contém os três componentes principais do
         * RedBeanPHP: o adaptador, o gravador de consultas e a
         * funcionalidade principal do RedBeanPHP em OODB.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class ToolBox
        {
            /**
             * @var OODB.
             */
            protected $oodb;

            /**
             * @var QueryWriter.
             */
            protected $writer;

            /**
             * @var DBAdapter.
             */
            protected $adapter;

            /**
             * Construtor.
             * A caixa de ferramentas é parte integrante do RedBeanPHP,
             * fornecendo os blocos de construção arquitetônicos básicos
             * para gerenciar objetos, auxiliares e ferramentas adicionais
             * como plug-ins. Uma caixa de ferramentas contém os três
             * componentes principais do RedBeanPHP: o adaptador, o
             * gravador de consultas e a funcionalidade principal do
             * RedBeanPHP em OODB.
             *
             * Uso:
             *     <code>
             *         $toolbox = new ToolBox($oodb, $adapter, $writer);
             *         $plugin = new MyPlugin($toolbox);
             *     </code>
             *
             * O exemplo acima ilustra como a caixa de ferramentas é
             * usada. Os objetos principais são passados para o
             * construtor ToolBox para montar uma instância da caixa
             * de ferramentas. A caixa de ferramentas é então passada
             * para o objeto plugin, auxiliar ou gerenciador. Instâncias
             * de TagManager, AssociationManager e assim por diante são
             * exemplos disso, todas elas requerem uma caixa de ferramentas.
             * A caixa de ferramentas também pode ser obtida na facade
             * usando: R::getToolBox();
             *
             * @param OODB        $oodb    Banco de dados de objetos, OODB.
             * @param DBAdapter   $adapter Adaptador de banco de dados.
             * @param QueryWriter $writer  Escritor de consultas.
             */
            public function __construct(OODB $oodb, Adapter $adapter, QueryWriter $writer)
            {
                $this->oodb = $oodb;
                $this->adapter = $adapter;
                $this->writer = $writer;

                return $this;
            }

            /**
             * Retorna o gravador de consulta nesta caixa de ferramentas.
             * O Query Writer é responsável por construir as consultas
             * para um banco de dados específico e executá-las através
             * do adaptador.
             *
             * Uso:
             *     <code>
             *         $toolbox = R::getToolBox();
             *         $redbean = $toolbox->getRedBean();
             *         $adapter = $toolbox->getDatabaseAdapter();
             *         $writer  = $toolbox->getWriter();
             *     </code>
             *
             * O exemplo acima ilustra como obter os objetos principais
             * de uma instância de caixa de ferramentas. Se você estiver
             * trabalhando apenas com o objeto R, também existirão os
             * seguintes atalhos:
             *     - R::getRedBean()
             *     - R::getDatabaseAdapter()
             *     - R::getWriter()
             *
             * @return QueryWriter.
             */
            public function getWriter()
            {
                return $this->writer;
            }

            /**
             * Retorna a instância OODB nesta caixa de ferramentas.
             * OODB é responsável por criar, armazenar, recuperar
             * e excluir beans únicos. Outros componentes dependem
             * do OODB para sua funcionalidade básica.
             *
             * Uso:
             *     <code>
             *         $toolbox = R::getToolBox();
             *         $redbean = $toolbox->getRedBean();
             *         $adapter = $toolbox->getDatabaseAdapter();
             *         $writer  = $toolbox->getWriter();
             *     </code>
             *
             * O exemplo acima ilustra como obter os objetos principais
             * de uma instância de caixa de ferramentas. Se você estiver
             * trabalhando apenas com o objeto R, também existirão os
             * seguintes atalhos:
             *     - R::getRedBean()
             *     - R::getDatabaseAdapter()
             *     - R::getWriter()
             * @return OODB.
             */
            public function getRedBean()
            {
                return $this->oodb;
            }

            /**
             * Retorna o adaptador de banco de dados nesta caixa
             * de ferramentas. O adaptador é responsável por executar
             * a consulta e vincular os valores. O adaptador também
             * cuida do tratamento das transações.
             *
             * Uso:
             *     <code>
             *         $toolbox = R::getToolBox();
             *         $redbean = $toolbox->getRedBean();
             *         $adapter = $toolbox->getDatabaseAdapter();
             *         $writer  = $toolbox->getWriter();
             *     </code>
             *
             * O exemplo acima ilustra como obter os objetos principais
             * de uma instância de caixa de ferramentas. Se você estiver
             * trabalhando apenas com o objeto R, também existirão os
             * seguintes atalhos:
             *     - R::getRedBean()
             *     - R::getDatabaseAdapter()
             *     - R::getWriter()
             * @return DBAdapter.
             */
            public function getDatabaseAdapter()
            {
                return $this->adapter;
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        /**
         * Localizador RedBeanPHP. Classe de serviço para encontrar
         * beans. Na maior parte, esta classe oferece métodos utilitários
         * fáceis de usar para interagir com o método OODB::find(),
         * que é bastante complexo. Esta classe pode ser usada para
         * localizar beans usando consultas SQL simples e antigas.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Finder
        {
            /**
             * @var ToolBox.
             */
            protected $toolbox;

            /**
             * @var OODB.
             */
            protected $redbean;

            /**
             * Construtor. O Finder requer uma caixa de ferramentas.
             *
             * @param ToolBox $toolbox.
             */
            public function __construct(ToolBox $toolbox)
            {
                $this->toolbox = $toolbox;
                $this->redbean = $toolbox->getRedBean();
            }

            /**
             * Uma função de mapeamento customizada de registro para
             * bean para findMulti.
             *
             * Uso:
             *     <code>
             *         $collection = R::findMulti(
             *             "shop,product,price",
             *             "SELECT shop.*, product.*, price.* FROM shop
             *                  LEFT JOIN product ON product.shop_id = shop.id
             *                  LEFT JOIN price ON price.product_id = product.id", [], [
             *                      Finder::map( "shop", "product" ),
             *                      Finder::map( "product", "price" ),
             *         ]);
             *     </code>
             *
             * @param string $parentName Nome do bean pai.
             * @param string $childName  Nome do bean filho.
             * @return array.
             */
            public static function map($parentName, $childName)
            {
                return array(
                    "a" => $parentName,
                    "b" => $childName,
                    "matcher" => function($parent, $child) use ($parentName, $childName)
                    {
                        $propertyName = "own" . ucfirst( $childName );
                        if (!isset($parent[$propertyName]))
                        {
                            $parent->noLoad()->{$propertyName} = array();
                        }

                        /**
                         *
                         */
                        $property = "{$parentName}ID";

                        /**
                         *
                         */
                        return ( $child->$property == $parent->id );
                    },

                    "do" => function($parent, $child) use ($childName)
                    {
                        $list = "own".ucfirst( $childName )."List";
                        $parent->noLoad()->{$list}[$child->id] = $child;
                    }
                );
            }

            /**
             * Uma função de mapeamento customizada de registro
             * para bean para findMulti.
             *
             * Uso:
             *     <code>
             *         $collection = R::findMulti(
             *             "book,book_tag,tag",
             *             "SELECT book.*, book_tag.*, tag.* FROM book
             *                  LEFT JOIN book_tag ON book_tag.book_id = book.id
             *                  LEFT JOIN tag ON book_tag.tag_id = tag.id", [], [
             *                      Finder::nmMap( "book", "tag" ),
             *         ]);
             *     </code>
             *
             * @param string $parentName  Nome do bean pai.
             * @param string $childName   Nome do bean filho.
             * @return array.
             */
            public static function nmMap( $parentName, $childName )
            {
                $types = array($parentName, $childName);
                sort($types);

                /**
                 *
                 */
                $link = implode("_", $types);

                /**
                 *
                 */
                return array(
                    "a" => $parentName,
                    "b" => $childName,
                    "matcher" => function($parent, $child, $beans) use ($parentName, $childName, $link)
                    {
                        $propertyName = "shared" . ucfirst( $childName );
                        if (!isset($parent[$propertyName]))
                        {
                            $parent->noLoad()->{$propertyName} = array();
                        }

                        foreach($beans[$link] as $linkBean)
                        {
                            if ($linkBean["{$parentName}ID"] == $parent->id && $linkBean["{$childName}ID"] == $child->id)
                            {
                                return true;
                            }
                        }
                    },

                    "do" => function($parent, $child) use ($childName)
                    {
                        $list = "shared".ucfirst( $childName )."List";
                        $parent->noLoad()->{$list}[$child->id] = $child;
                    }
                );
            }

            /**
             * Finder::onMap() -> Mapeamento One-to-N. Uma função
             * de mapeamento customizada de registro para bean
             * para findMulti. Oposto de Finder::map(). Mapeia
             * beans filhos para os pais.
             *
             * Uso:
             *     <code>
             *         $collection = R::findMulti(
             *             "shop,product",
             *             "SELECT shop.*, product.* FROM shop
             *                  LEFT JOIN product ON product.shop_id = shop.id",
             *                  [], [
             *                      Finder::onmap( "product", "shop" ),
             *         ]);
             *     </code>
             *
             * Também pode ser usado, por exemplo, para anexar beans
             * relacionados de uma só vez para salvar algumas
             * consultas:
             *
             * Dados $users que possuem um country_id:
             *     <code>
             *         $all = R::findMulti(
             *             "country",
             *
             *             R::genSlots(
             *                 $users,
             *                 "SELECT country.* FROM country WHERE id IN ( %s )"
             *             ),
             *
             *             array_column($users, "country_id"),
             *             [
             *                 Finder::onmap("country", $users)
             *             ]
             *         );
             *     </code>
             *
             * Para sua conveniência, uma notação ainda mais curta
             * foi adicionada:
             *
             * $countries = R::loadJoined($users, "country");
             *
             * @param string       $parentName Nome do bean pai.
             * @param string|array $childName  Nome do bean filho.
             * @return array.
             */
            public static function onMap($parentName, $childNameOrBeans)
            {
                return array(
                    "a" => $parentName,
                    "b" => $childNameOrBeans,
                    "matcher" => array($parentName, "{$parentName}_id"),
                    "do" => "match"
                );
            }

            /**
             * Encontra um bean usando um tipo e uma cláusula
             * where (SQL). Tal como acontece com a maioria
             * das ferramentas de consulta no RedBean, você
             * pode fornecer valores a serem inseridos na
             * instrução SQL preenchendo o parâmetro do vetor
             * de valores; você pode usar a notação de ponto
             * de interrogação ou a notação de slot (:keyname).
             *
             * @param string      $type type O tipo de bean que você procura.
             * @param string|NULL $sql  sql  Consulta SQL para encontrar o bean
             *                               desejado, começando logo após a
             *                               cláusula WHERE.
             * @param array       $bindings  Array de valores a serem vinculados
             *                               aos parâmetros na consulta.
             * @return array.
             */
            public function find($type, $sql = NULL, $bindings = array())
            {
                if (!is_array($bindings))
                {
                    throw new RedException(
                        "Expected array, " . gettype($bindings) . " given."
                    );
                }

                return $this->redbean->find($type, array(), $sql, $bindings);
            }

            /**
             * Como find() mas também exporta os beans como um
             * array. Este método executará uma operação de
             * localização. Para cada bean na coleção de
             * resultados, este método chamará o método export().
             * Este método retorna um array contendo as representações
             * de array de cada bean no conjunto de resultados.
             *
             * @see Finder::find.
             *
             * @param string      $type type O tipo de bean que você procura.
             * @param string|NULL $sql  sql  Consulta SQL para encontrar o bean
             *                               desejado, começando logo após a
             *                               cláusula WHERE.
             * @param array       $bindings  Array de valores a serem vinculados
             *                               aos parâmetros na consulta.
             * @return array.
             */
            public function findAndExport($type, $sql = NULL, $bindings = array())
            {
                $arr = array();
                foreach ($this->find($type, $sql, $bindings) as $key => $item)
                {
                    $arr[] = $item->export();
                }

                return $arr;
            }

            /**
             * Como find() mas retorna apenas um bean em vez de um
             * vetor de beans. Este método retornará apenas o
             * primeiro bean do array. Se nenhum bean for
             * encontrado, este método retornará NULL.
             *
             * @see Finder::find.
             * @param string      $type type O tipo de bean que você procura.
             * @param string|NULL $sql  sql  Consulta SQL para encontrar o bean
             *                               desejado, começando logo após a
             *                               cláusula WHERE.
             * @param array       $bindings  Array de valores a serem vinculados
             *                               aos parâmetros na consulta.
             * @return OODBBean|NULL.
             */
            public function findOne($type, $sql = NULL, $bindings = array())
            {
                $sql = $this->toolbox->getWriter()->glueLimitOne($sql);
                $items = $this->find($type, $sql, $bindings);

                if (empty($items))
                {
                    return NULL;
                }

                return reset($items);
            }

            /**
             * Como find() mas retorna o último bean do vetor de
             * resultados. Oposto de Finder::findLast(). Se nenhum
             * bean for encontrado, este método retornará NULL.
             *
             * @see Finder::find.
             * @param string      $type     O tipo de bean que você procura.
             * @param string|NULL $sql      Consulta SQL para encontrar o bean
             *                              desejado, começando logo após a
             *                              cláusula WHERE.
             * @param array       $bindings Array de valores a serem vinculados
             *                              aos parâmetros na consulta.
             * @return OODBBean|NULL.
             */
            public function findLast($type, $sql = NULL, $bindings = array())
            {
                $items = $this->find($type, $sql, $bindings);
                if (empty($items))
                {
                    return NULL;
                }

                return end($items);
            }

            /**
             * Tenta encontrar beans de um determinado tipo, se nenhum
             * bean for encontrado, dispensa um bean desse tipo. Observe
             * que esta função sempre retorna um array.
             *
             * @see Finder::find.
             * @param  string      $type     O tipo de bean que você procura.
             * @param  string|NULL $sql      Consulta SQL para encontrar o bean
             *                               desejado, começando logo após a
             *                               cláusula WHERE.
             * @param  array       $bindings Array de valores a serem vinculados
             *                               aos parâmetros na consulta.
             * @return array.
             */
            public function findOrDispense($type, $sql = NULL, $bindings = array())
            {
                $foundBeans = $this->find($type, $sql, $bindings);

                if (empty($foundBeans))
                {
                    return array(
                        $this->redbean->dispense($type)
                    );
                } else
                {
                    return $foundBeans;
                }
            }

            /**
             * Encontra um BeanCollection usando o repositório. Uma
             * coleção de beans pode ser usada para recuperar um
             * bean por vez usando cursors - isso é útil para
             * processar grandes conjuntos de dados. Uma coleção de
             * beans não carregará todos os beans na memória de uma
             * só vez, apenas um de cada vez.
             *
             * @param  string $type     O tipo de bean que você procura.
             * @param  string $sql      Consulta SQL para encontrar o bean
             *                          desejado, começando logo após a
             *                          cláusula WHERE.
             * @param  array  $bindings Array de valores a serem vinculados
             *                          aos parâmetros na consulta.
             * @return BeanCollection.
             */
            public function findCollection($type, $sql, $bindings = array())
            {
                return $this->redbean->findCollection(
                    $type,
                    $sql,
                    $bindings
                );
            }

            /**
             * Encontra ou cria um bean. Tenta encontrar um bean
             * com certas propriedades especificadas no segundo
             * parâmetro ($like). Se o bean for encontrado, ele
             * será devolvido. Se vários beans forem encontrados,
             * apenas o primeiro será retornado. Se nenhum bean
             * atender aos critérios, um novo bean será dispensado,
             * os critérios serão importados como propriedades e
             * esse novo bean será armazenado e retornado.
             *
             * Formato do conjunto de critérios: property => value.
             * O conjunto de critérios também suporta condições
             * OR: property => array(value1, orValue2).
             *
             * @param string  $type           Tipo de bean a ser pesquisado.
             * @param array   $like           Conjunto de critérios que
             *                                descreve o bean a ser
             *                                pesquisado.
             * @param boolean $hasBeenCreated Definido como true se o bean
             *                                tiver sido criado.
             * @return OODBBean.
             */
            public function findOrCreate($type, $like = array(), $sql = "", &$hasBeenCreated = false)
            {
                $sql = $this->toolbox->getWriter()->glueLimitOne($sql);
                $beans = $this->findLike($type, $like, $sql);

                if (count($beans))
                {
                    $bean = reset($beans);
                    $hasBeenCreated = false;

                    return $bean;
                }

                $bean = $this->redbean->dispense($type);
                $bean->import($like);
                $this->redbean->store($bean);
                $hasBeenCreated = true;

                return $bean;
            }

            /**
             * Encontra beans por seu tipo e um determinado conjunto
             * de critérios.
             *
             * Formato do conjunto de critérios: property => value.
             * O conjunto de critérios também suporta condições OR:
             * property => array(value1, orValue2).
             *
             * Se o SQL adicional for uma condição, essa condição
             * será colada ao restante da consulta usando um operador
             * AND. Observe que isso é o máximo que esse método pode
             * ir, não há como colar SQL adicional usando uma condição
             * OR. Este método fornece acesso a um mecanismo subjacente
             * na arquitetura RedBeanPHP para localizar beans usando
             * conjuntos de critérios. No entanto, não use este método
             * para consultas complexas; em vez disso, use SQL simples
             * (o método find regular), pois é mais adequado para o
             * trabalho. Este método destina-se a operações básicas de
             * pesquisa por exemplo.
             *
             * @param string $type       Tipo de bean a ser pesquisado.
             * @param array  $conditions Conjunto de critérios que descreve
             *                           o bean a ser pesquisado.
             * @param string $sql        SQL adicional (para classificação).
             * @param array  $bindings   Ligações.
             * @return array.
             */
            public function findLike($type, $conditions = array(), $sql = "", $bindings = array())
            {
                return $this->redbean->find(
                    $type,
                    $conditions,
                    $sql,
                    $bindings
                );
            }

            /**
             * Retorna um hashmap com vetor de bean codificadas por
             * tipo usando uma consulta SQL como recurso. Dada uma
             * consulta SQL como "SELECT movie.*, review.* FROM movie... JOIN review"
             * este método retornará beans de filme e revisão.
             *
             * Exemplo:
             *     <code>
             *         $stuff = $finder->findMulti("movie,review", "
             *             SELECT movie.*, review.* FROM movie
             *             LEFT JOIN review ON review.movie_id = movie.id");
             *     </code>
             *
             * Após esta operação, $stuff conterá uma entrada "movie"
             * contendo todos os filmes e uma entrada chamada "review"
             * contendo todas as resenhas (todos os beans). Você também
             * pode passar ligações.
             *
             * Se você deseja remapear seus beans, para poder usar
             * $movie->ownReviewList sem que o RedBeanPHP execute
             * uma consulta SQL, você pode usar o quarto parâmetro
             * para definir uma seleção de fechamentos de
             * remapeamento.
             *
             * O argumento remapeamento (opcional) deve conter um
             * vetor de vetores. Cada vetor no vetor de remapeamento
             * deve conter as seguintes entradas:
             *     <code>
             *         array(
             *             "a" => TYPE A
             *             "b" => TYPE B OR BEANS
             *             "matcher" =>
             *                  MATCHING FUNCTION ACCEPTING A, B and ALL BEANS
             *                  OR ARRAY
             *                      WITH FIELD on B that should match with FIELD on A
             *                      AND  FIELD on A that should match with FIELD on B
             *                  OR TRUE
             *                      TO JUST PERFORM THE DO-FUNCTION ON EVERY A-BEAN
             *             "do" => OPERATION FUNCTION ACCEPTING A, B, ALL BEANS, ALL REMAPPINGS
             *                 (ONLY IF MATCHER IS ALSO A FUNCTION)
             *         )
             *     </code>
             *
             * Usando este mecanismo você pode construir seu
             * próprio "pré-carregador" com pequenos trechos de
             * funções (e esses podem ser reutilizados e compartilhados
             * online, é claro).
             *
             * Exemplo:
             *     <code>
             *         array(
             *             "a" => "movie"  // Defina A como filme.
             *             "b" => "review" // Defina B como revisão.
             *             "matcher" => function($a, $b)
             *             {
             *                 //
             *                 // Execute a ação se review.movie_id for
             *                 // igual a movie.id.
             *                 //
             *                 return ( $b->movie_id == $a->id );
             *             }
             *
             *             "do" => function($a, $b)
             *             {
             *                 //
             *                 // Adicione a crítica ao filme.
             *                 //
             *                 $a->noLoad()->ownReviewList[] = $b;
             *
             *                 //
             *                 // Opcional, aja "como se esses beans tivessem
             *                 // sido carregados através de ownReviewList".
             *                 //
             *                 $a->clearHistory();
             *             }
             *         )
             *     </code>
             *
             * O parâmetro Query Template também é opcional, mas pode
             * ser usado para definir um modelo SQL diferente (estilo
             * sprintf) para processar a consulta original.
             *
             * @observação a consulta SQL fornecida NÃO É A usada
             * internamente por esta função, esta função irá pré-processar
             * a consulta para obter todos os dados necessários
             * para encontrar os beans.
             *
             * @observação se você usar a notação "book.*",
             * certifique-se de que seu seletor comece com um
             * ESPAÇO. " book.*" NÃO ",book.*". Isso ocorre porque
             * na verdade é um modelo SLOT semelhante ao SQL, não
             * SQL real.
             *
             * @observação em vez de uma consulta SQL, você também
             * pode passar um vetor de resultados.
             *
             * @observação o desempenho desta função é ruim; se você
             * lidar com um grande número de registros, use SQL
             * simples. Esta função foi adicionada como uma ponte entre
             * SQL simples e abordagens orientadas a bean, mas está
             * realmente no limite dos dois mundos. Você pode usar esta
             * função com segurança para carregar registros adicionais
             * como beans no contexto paginado, digamos 50-250 registros.
             * Qualquer coisa acima disso terá um desempenho gradualmente
             * pior. O RedBeanPHP nunca teve a intenção de substituir o
             * SQL, mas oferecer ferramentas para integrar o SQL com
             * designs orientados a objetos. Se você chegou a esta função,
             * atingiu a fronteira final entre o design orientado a SQL e
             * OOP. Qualquer coisa depois disso será tão boa quanto o
             * mapeamento personalizado ou a consulta antiga ao banco de
             * dados. Eu recomendo o último.
             *
             * @param string|array $types         Uma lista de tipos (array ou
             *                                    string separada por vírgula).
             * @param string|array $sql           Opcional, uma consulta SQL ou
             *                                    um vetor de registros pré-buscados.
             * @param array        $bindings      Opcional, ligações para consulta SQL.
             * @param array        $remappings    Opcional, um vetor de vetores
             *                                    de remapeamento.
             * @param string       $queryTemplate Opcional, modelo de consulta.
             * @return array.
             */
            public function findMulti($types, $sql = NULL, $bindings = array(), $remappings = array(), $queryTemplate = ' %s.%s AS %s__%s')
            {
                if (!is_array($types))
                {
                    $types = array_map(
                        "trim",
                        explode(
                            ",",
                            $types
                        )
                    );
                }

                if (is_null($sql))
                {
                    $beans = array();
                    foreach ($types as $type)
                    {
                        $beans[$type] = $this->redbean->find($type);
                    }
                } else
                {
                    if (!is_array($sql))
                    {
                        $writer = $this->toolbox->getWriter();
                        $adapter = $this->toolbox->getDatabaseAdapter();

                        /**
                         * Repare a consulta, substitua book.* por
                         * book.id AS book_id etc.
                         */
                        foreach ($types as $type)
                        {
                            $regex = "#( (`?{$type}`?)\.\*)#";
                            if (preg_match($regex, $sql, $matches))
                            {
                                $pattern = $matches[1];
                                $table = $matches[2];
                                $newSelectorArray = array();
                                $columns = $writer->getColumns($type);

                                foreach($columns as $column => $definition)
                                {
                                    $newSelectorArray[] = sprintf(
                                        $queryTemplate,
                                        $table,
                                        $column,
                                        $type,
                                        $column
                                    );
                                }

                                $newSelector = implode(",", $newSelectorArray);
                                $sql = str_replace($pattern, $newSelector, $sql);
                            }
                        }

                        $rows = $adapter->get($sql, $bindings);
                    } else
                    {
                        $rows = $sql;
                    }

                    /**
                     * Reúna os dados do bean dos resultados da consulta
                     * usando o prefixo.
                     */
                    $wannaBeans = array();

                    /**
                     *
                     */
                    foreach($types as $type)
                    {
                        $wannaBeans[$type] = array();
                        $prefix = "{$type}__";

                        foreach ($rows as $rowkey => $row)
                        {
                            $wannaBean = array();
                            foreach ($row as $cell => $value)
                            {
                                if (strpos($cell, $prefix) === 0)
                                {
                                    $property = substr($cell, strlen($prefix));
                                    unset($rows[$rowkey][$cell]);

                                    $wannaBean[$property] = $value;
                                }
                            }

                            if (!isset($wannaBean["id"]))
                            {
                                continue;
                            }

                            if (is_null($wannaBean["id"]))
                            {
                                continue;
                            }

                            $wannaBeans[$type][$wannaBean["id"]] = $wannaBean;
                        }
                    }

                    /**
                     * Transforme as linhas em beans.
                     */
                    $beans = array();
                    foreach ($wannaBeans as $type => $wannabees)
                    {
                        $beans[$type] = $this->redbean->convertToBeans(
                            $type,
                            $wannabees
                        );
                    }
                }

                /**
                 * Aplique remapeamentos adicionais.
                 */
                foreach ($remappings as $remapping)
                {
                    $a = $remapping["a"];
                    $b = $remapping["b"];

                    if (is_array($b))
                    {
                        $firstBean = reset($b);
                        $type = $firstBean->getMeta("type");

                        $beans[$type] = $b;
                        $b = $type;
                    }

                    $matcher = $remapping["matcher"];
                    if (is_callable($matcher) || $matcher === true)
                    {
                        $do = $remapping["do"];
                        foreach($beans[$a] as $bean)
                        {
                            if ($matcher === true)
                            {
                                $do(
                                    $bean,
                                    $beans[$b],
                                    $beans,
                                    $remapping
                                );

                                continue;
                            }

                            foreach ($beans[$b] as $putBean)
                            {
                                if ($matcher($bean, $putBean, $beans))
                                {
                                    $do(
                                        $bean,
                                        $putBean,
                                        $beans,
                                        $remapping
                                    );
                                }
                            }
                        }
                    } else
                    {
                        list($field1, $field2) = $matcher;
                        foreach ($beans[$b] as $key => $bean)
                        {
                            $beans[$b][$key]->{$field1} = (
                                isset(
                                    $beans[$a][$bean->{$field2}]
                                ) ? $beans[$a][$bean->{$field2}] : NULL
                            );
                        }
                    }
                }

                return $beans;
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\Adapter\DBAdapter as DBAdapter;
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\RedException as RedException;
        use RedBeanPHP\RedException\SQL as SQLException;


        /**
         * Gerente da Associação. O gerenciador de associações
         * pode ser usado para criar e gerenciar relações
         * muitos-para-muitos (por exemplo, sharedLists). Em
         * uma relação muitos-para-muitos, um bean pode estar
         * associado a muitos outros beans, enquanto cada um
         * desses beans também pode estar relacionado a vários
         * beans.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class AssociationManager extends Observable
        {
            /**
             * @var OODB.
             */
            protected $oodb;

            /**
             * @var DBAdapter.
             */
            protected $adapter;

            /**
             * @var QueryWriter.
             */
            protected $writer;

            /**
             * @var ToolBox.
             */
            public $toolbox;

            /**
             * Manipulador de exceções. Os modos Fluid e Frozen têm
             * maneiras diferentes de lidar com exceções. O modo
             * fluido (usando o repositório fluido) ignora exceções
             * causadas pelo seguinte:
             *     - Tabelas faltantes.
             *     - Coluna faltante.
             *
             * Nessas situações, o repositório se comportará como se
             * nenhum bean pudesse ser encontrado. Isso ocorre porque
             * no modo fluido pode acontecer de consultar uma tabela
             * ou coluna que ainda não foi criada. No modo congelado,
             * isso não deveria acontecer e as exceções correspondentes
             * serão lançadas.
             *
             * @param \Exception $exception Exceção.
             * @return void.
             */
            private function handleException(\Exception $exception)
            {
                if ($this->oodb->isFrozen() || !$this->writer->sqlStateIn($exception->getSQLState(),
                    array(
                        QueryWriter::C_SQLSTATE_NO_SUCH_TABLE,
                        QueryWriter::C_SQLSTATE_NO_SUCH_COLUMN
                    ), $exception->getDriverDetails()))
                {
                    throw $exception;
                }
            }

            /**
             * Método interno. Retorna as linhas relacionadas
             * muitos-para-muitos da tabela $type para o bean
             * $bean usando SQL adicional nas ligações $sql e
             * $bindings. Se $getLinks for true, as linhas do
             * link serão retornadas.
             *
             * @param OODBBean $bean     Instância do bean de referência.
             * @param string   $type     Tipo de bean alvo.
             * @param string   $sql      Trecho SQL adicional.
             * @param array    $bindings Ligações para consulta.
             * @return array.
             */
            private function relatedRows($bean, $type, $sql = "", $bindings = array())
            {
                $ids = array($bean->id);
                $sourceType = $bean->getMeta("type");

                try
                {
                    return $this->writer->queryRecordRelated(
                        $sourceType,
                        $type,
                        $ids,
                        $sql,
                        $bindings
                    );
                } catch (SQLException $exception)
                {
                    $this->handleException($exception);

                    return array();
                }
            }

            /**
             * Associa um par de beans. Este método associa dois
             * beans, independentemente dos tipos. Aceita um bean
             * base que contém dados para o registro de vinculação.
             * Este método é usado por associado. Este método também
             * aceita um bean base para ser usado como modelo para
             * o registro do link no banco de dados.
             *
             * @param OODBBean $bean1 Primeiro bean.
             * @param OODBBean $bean2 Segundo bean.
             * @param OODBBean $bean  Bean base (registro de associação).
             * @return mixed.
             */
            protected function associateBeans(OODBBean $bean1, OODBBean $bean2, OODBBean $bean)
            {
                $type = $bean->getMeta("type");
                $property1 = $bean1->getMeta("type") . "_id";
                $property2 = $bean2->getMeta("type") . "_id";

                if ($property1 == $property2)
                {
                    $property2 = $bean2->getMeta("type") . "2_id";
                }

                $this->oodb->store($bean1);
                $this->oodb->store($bean2);

                $bean->setMeta("cast.$property1", "id");
                $bean->setMeta("cast.$property2", "id");
                $bean->setMeta("sys.buildcommand.unique", array($property1, $property2));

                $bean->$property1 = $bean1->id;
                $bean->$property2 = $bean2->id;
                $results = array();

                try
                {
                    $id = $this->oodb->store($bean);
                    $results[] = $id;
                } catch (SQLException $exception)
                {
                    if (!$this->writer->sqlStateIn($exception->getSQLState(),
                        array(
                            QueryWriter::C_SQLSTATE_INTEGRITY_CONSTRAINT_VIOLATION
                        ), $exception->getDriverDetails()))
                    {
                        throw $exception;
                    }
                }

                return $results;
            }

            /**
             * Construtor, cria uma nova instância do Association
             * Manager. O gerenciador de associações pode ser usado
             * para criar e gerenciar relações muitos-para-muitos
             * (por exemplo, sharedLists). Em uma relação
             * muitos-para-muitos, um bean pode estar associado a
             * muitos outros beans, enquanto cada um desses beans
             * também pode estar relacionado a vários beans. Para
             * criar uma instância do Association Manager você
             * precisará passar um objeto ToolBox.
             *
             * @param ToolBox $tools Caixa de ferramentas que fornece objetos
             *                       principais do RedBeanPHP.
             */
            public function __construct(ToolBox $tools)
            {
                $this->oodb = $tools->getRedBean();
                $this->adapter = $tools->getDatabaseAdapter();
                $this->writer = $tools->getWriter();
                $this->toolbox = $tools;
            }

            /**
             * Cria um nome de tabela com base em um vetor
             * de tipos. Gerencia a obtenção do nome correto
             * da tabela de vinculação para os tipos fornecidos.
             *
             * @param array $types 2 tipos como strings.
             * @return string.
             */
            public function getTable($types)
            {
                return $this->writer->getAssocTable($types);
            }

            /**
             * Associa dois beans em uma relação muitos para muitos.
             * Este método associará dois beans e armazenará a conexão
             * entre os dois em uma tabela de links. Em vez de dois
             * beans únicos, este método também aceita dois conjuntos
             * de beans. Retorna o ID ou os IDs dos beans vinculados.
             *
             * @param OODBBean|array $beans1 Um ou mais beans para formar a
             *                               associação.
             * @param OODBBean|array $beans2 Um ou mais beans para formar a
             *                               associação.
             * @return array.
             */
            public function associate($beans1, $beans2)
            {
                if (!is_array($beans1))
                {
                    $beans1 = array($beans1);
                }

                if (!is_array($beans2))
                {
                    $beans2 = array( $beans2 );
                }

                $results = array();
                foreach ($beans1 as $bean1)
                {
                    foreach ($beans2 as $bean2)
                    {
                        $table = $this->getTable(
                            array(
                                $bean1->getMeta("type"),
                                $bean2->getMeta("type")
                            )
                        );

                        $bean = $this->oodb->dispense($table);
                        $results[] = $this->associateBeans(
                            $bean1,
                            $bean2,
                            $bean
                        );
                    }
                }

                return (
                    count($results) > 1
                ) ? $results : reset($results);
            }

            /**
             * Conta o número de beans relacionados em uma relação
             * N-M. Este método retorna o número de beans do tipo
             * $type associados ao(s) bean(s) de referência $bean.
             * A consulta pode ser ajustada usando um snippet SQL
             * para filtragem adicional.
             *
             * @param OODBBean|array $bean     Um objeto bean ou um vetor de beans.
             * @param string         $type     Tipo de bean no qual você está interessado.
             * @param string|NULL    $sql      Fragmento SQL (opcional).
             * @param array          $bindings Ligações para sua string SQL.
             * @return integer.
             */
            public function relatedCount($bean, $type, $sql = NULL, $bindings = array())
            {
                if (!($bean instanceof OODBBean))
                {
                    throw new RedException(
                        "Expected array or OODBBean but got:" . gettype($bean)
                    );
                }

                if (!$bean->id)
                {
                    return 0;
                }

                /**
                 *
                 */
                $beanType = $bean->getMeta("type");

                try
                {
                    return $this->writer->queryRecordCountRelated(
                        $beanType,
                        $type,
                        $bean->id,
                        $sql,
                        $bindings
                    );
                } catch (SQLException $exception)
                {
                    $this->handleException($exception);

                    return 0;
                }
            }

            /**
             * Quebra a associação entre dois beans. Este método
             * desassocia dois beans. Se o método for bem-sucedido,
             * os beans não formarão mais uma associação. No banco
             * de dados isso significa que o registro de associação
             * será removido. Este método usa o método OODB trash()
             * para remover os links de associação, dando assim aos
             * modelos FUSE a oportunidade de conectar lógica de
             * negócios adicional. Se o parâmetro $fast estiver
             * definido como booleano true, este método removerá os
             * beans sem o seu consentimento, ignorando o FUSE. Isso
             * pode ser usado para melhorar o desempenho.
             *
             * @param OODBBean $beans1 Primeiro bean na associação alvo.
             * @param OODBBean $beans2 Segundo bean na associação alvo.
             * @param boolean  $fast   Se true, remove as entradas por
             *                         consulta sem FUSE.
             * @return void.
             */
            public function unassociate($beans1, $beans2, $fast = NULL)
            {
                $beans1 = (!is_array($beans1)) ? array($beans1) : $beans1;
                $beans2 = (!is_array($beans2)) ? array($beans2) : $beans2;

                foreach ($beans1 as $bean1)
                {
                    foreach ($beans2 as $bean2)
                    {
                        try
                        {
                            $this->oodb->store($bean1);
                            $this->oodb->store($bean2);

                            $type1 = $bean1->getMeta("type");
                            $type2 = $bean2->getMeta("type");
                            $row = $this->writer->queryRecordLink(
                                $type1,
                                $type2,
                                $bean1->id,
                                $bean2->id
                            );

                            if (!$row)
                            {
                                return;
                            }

                            $linkType = $this->getTable(
                                array(
                                    $type1,
                                    $type2
                                )
                            );

                            if ($fast)
                            {
                                $this->writer->deleteRecord(
                                    $linkType,
                                    array(
                                        "id" => $row["id"]
                                    )
                                );

                                return;
                            }

                            $beans = $this->oodb->convertToBeans(
                                $linkType,
                                array(
                                    $row
                                )
                            );

                            if (count($beans) > 0)
                            {
                                $bean = reset($beans);
                                $this->oodb->trash($bean);
                            }
                        } catch (SQLException $exception)
                        {
                            $this->handleException($exception);
                        }
                    }
                }
            }

            /**
             * Remove todas as relações de um bean. Este método quebra
             * todas as conexões entre um determinado bean $bean e todos
             * os outros bean do tipo $type. Atenção: este método é muito
             * rápido porque utiliza uma consulta SQL direta, porém não
             * informa os modelos sobre isso. Se você deseja notificar
             * os modelos FUSE sobre a exclusão, use um loop foreach
             * com unassociate(). (isso pode ser mais lento).
             *
             * @param OODBBean $bean Bean de referência.
             * @param string   $type Tipo de bean que precisa ser desassociado.
             * @return void.
             */
            public function clearRelations(OODBBean $bean, $type)
            {
                $this->oodb->store($bean);

                try
                {
                    $this->writer->deleteRelations(
                        $bean->getMeta("type"),
                        $type,
                        $bean->id
                    );
                } catch (SQLException $exception)
                {
                    $this->handleException($exception);
                }
            }

            /**
             * Retorna todos os beans associados a $bean. Este método
             * retornará um array contendo todos os beans que foram
             * associados uma vez à função associate() e ainda estão
             * associados ao bean especificado. O parâmetro type indica
             * o tipo de bean que você está procurando. Você também
             * pode passar alguns SQL e valores extras para esse SQL
             * para filtrar seus resultados após buscar os beans
             * relacionados.
             *
             * Não tente usar subconsultas, uma subconsulta usando
             * IN() parece ser mais lenta que duas consultas !
             *
             * Desde a versão 3.2, agora você também pode passar um
             * array de beans em vez de apenas um bean como primeiro
             * parâmetro.
             *
             * @param OODBBean $bean     O bean que você tem.
             * @param string   $type     O tipo de bean que você deseja.
             * @param string   $sql      Snippet SQL para filtragem extra.
             * @param array    $bindings Valores a serem inseridos em slots SQL.
             * @return array.
             */
            public function related($bean, $type, $sql = "", $bindings = array())
            {
                $sql = $this->writer->glueSQLCondition($sql);
                $rows = $this->relatedRows($bean, $type, $sql, $bindings);
                $links = array();

                foreach ($rows as $key => $row)
                {
                    if (!isset($links[$row["id"]]))
                    {
                        $links[$row["id"]] = array();
                    }

                    $links[$row["id"]][] = $row["linked_by"];
                    unset($rows[$key]["linked_by"]);
                }

                $beans = $this->oodb->convertToBeans($type, $rows);
                foreach ($beans as $bean)
                {
                    $bean->setMeta("sys.belongs-to", $links[$bean->id]);
                }

                return $beans;
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\ToolBox as ToolBox;
        use RedBeanPHP\OODBBean as OODBBean;


        /**
         * Interface auxiliar de bean.
         *
         * Interface para Bean Helper. Um pequeno parafuso que
         * une todo o maquinário. O Bean Helper é passado para
         * o objeto OODB RedBeanPHP para facilitar a criação de
         * beans e fornecer-lhes uma caixa de ferramentas. O
         * Helper também facilita o recurso FUSE, determinando
         * como os beans se relacionam com seus modelos. Ao
         * substituir o método getModelForBean, você pode
         * ajustar o FUSEing para atender às necessidades
         * do seu aplicativo de negócios.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        interface BeanHelper
        {
            /**
             * Retorna uma caixa de ferramentas para capacitar
             * o bean. Isso permite que os beans executem operações
             * OODB por si próprios, sendo assim, o bean é um proxy
             * para OODB. Isso permite que os beans implementem seus
             * getters e setters mágicos e listas de retorno.
             *
             * @return ToolBox.
             */
            public function getToolbox();

            /**
             * Faz aproximadamente o mesmo que getToolbox, mas
             * também extrai a caixa de ferramentas para você.
             * Este método retorna uma lista com todos os itens
             * da caixa de ferramentas na ordem do Construtor da
             * Caixa de Ferramentas: OODB, adaptador, gravador e
             * finalmente a própria caixa de ferramentas !
             *
             * @return array.
             */
            public function getExtractedToolbox();

            /**
             * Dado um determinado bean, este método retornará
             * o modelo correspondente.
             *
             * @param OODBBean $bean Bean para obter o modelo correspondente de.
             * @return SimpleModel|CustomModel|NULL.
             */
            public function getModelForBean(OODBBean $bean);
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\BeanHelper
    {
        use RedBeanPHP\BeanHelper as BeanHelper;
        use RedBeanPHP\Facade as Facade;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\SimpleModelHelper as SimpleModelHelper;


        /**
         * Bean Helper.
         * O auxiliar Bean ajuda os beans a acessar a caixa
         * de ferramentas e os modelos FUSE. Este Bean Helper
         * faz uso da facade para obter uma referência à caixa
         * de ferramentas.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class SimpleFacadeBeanHelper implements BeanHelper
        {
            /**
             * Função de fábrica para criar instância do Modelo
             * Simples, se houver.
             *
             * @var callable|NULL.
             */
            private static $factory = null;

            /**
             * Método de fábrica usando uma função de fábrica
             * personalizável para criar a instância do Modelo
             * Simples.
             *
             * @param string $modelClassName Nome da classe.
             * @return SimpleModel.
             */
            public static function factory($modelClassName)
            {
                $factory = self::$factory;

                return (
                    $factory
                ) ? $factory($modelClassName) : new $modelClassName();
            }

            /**
             * Define a função de fábrica para criar o modelo ao usar
             * FUSE para conectar um bean a um modelo.
             *
             * @param callable|NULL $factory Função de fábrica.
             * @return void.
             */
            public static function setFactoryFunction($factory)
            {
                self::$factory = $factory;
            }

            /**
             * @see BeanHelper::getToolbox.
             */
            public function getToolbox()
            {
                return Facade::getToolBox();
            }

            /**
             * @see BeanHelper::getModelForBean.
             */
            public function getModelForBean(OODBBean $bean)
            {
                $model = $bean->getMeta("type");
                $prefix = defined("REDBEAN_MODEL_PREFIX") ? REDBEAN_MODEL_PREFIX : "\\Model_";

                return $this->resolveModel(
                    $prefix,
                    $model,
                    $bean
                );
            }

            /**
             * Resolve o modelo associado ao bean usando o nome
             * do modelo (tipo), o prefixo e o bean.
             *
             * @observação.
             * Se REDBEAN_CLASS_AUTOLOAD for definido, isso será passado
             * para class_exist como sinalizador de carregamento
             * automático.
             *
             * @param string   $prefix Prefixo a ser usado para resolução.
             * @param string   $model  Digite o nome.
             * @param OODBBean $bean   Bean para resolver o modelo.
             * @return SimpleModel|CustomModel|NULL.
             */
            protected function resolveModel($prefix, $model, $bean)
            {
                /**
                 * Determine a preferência de carregamento automático.
                 */
                $autoloadFlag = (
                    defined("REDBEAN_CLASS_AUTOLOAD") ? REDBEAN_CLASS_AUTOLOAD : true
                );

                if (strpos($model, "_") !== false)
                {
                    $modelParts = explode("_", $model);
                    $modelName = "";

                    foreach($modelParts as $part)
                    {
                        $modelName .= ucfirst($part);
                    }

                    $modelName = $prefix . $modelName;
                    if (!class_exists($modelName))
                    {
                        $modelName = $prefix . ucfirst($model);
                        if (!class_exists($modelName, $autoloadFlag))
                        {
                            return NULL;
                        }
                    }
                } else
                {
                    $modelName = $prefix . ucfirst($model);
                    if (!class_exists($modelName, $autoloadFlag))
                    {
                        return NULL;
                    }
                }

                $obj = self::factory($modelName);
                $obj->loadBean($bean);

                return $obj;
            }

            /**
             * @see BeanHelper::getExtractedToolbox.
             */
            public function getExtractedToolbox()
            {
                return Facade::getExtractedToolbox();
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP\BeanHelper
    {
        use RedBeanPHP\BeanHelper as BeanHelper;
        use RedBeanPHP\Facade as Facade;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\SimpleModelHelper as SimpleModelHelper;
        use RedBeanPHP\BeanHelper\SimpleFacadeBeanHelper as SimpleFacadeBeanHelper;


        /**
         * Dynamic Bean Helper.
         *
         * O auxiliar de bean dinâmico permite usar classes com
         * namespaces diferentes para modelos por conexão de
         * banco de dados.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class DynamicBeanHelper extends SimpleFacadeBeanHelper implements BeanHelper
        {
            /**
             * Prefixo do modelo a ser usado para a conexão de
             * banco de dados atual.
             *
             * @var string.
             */
            private $modelPrefix;

            /**
             * Construtor.
             *
             * Uso:
             *     <code>
             *         R::addDatabase(..., new DynamicBeanHelper("Prefix1_"));
             *     </code>
             *
             * @param string $modelPrefix prefixo.
             */
            public function __construct($modelPrefix)
            {
                $this->modelPrefix = $modelPrefix;
            }

            /**
             * @see BeanHelper::getModelForBean.
             */
            public function getModelForBean(OODBBean $bean)
            {
                return $this->resolveModel(
                    $this->modelPrefix,
                    $bean->getMeta("type"),
                    $bean
                );
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\OODBBean as OODBBean;


        /**
         * SimpleModel.
         * Modelo base para todos os modelos RedBeanPHP usando FUSE.
         *
         * RedBeanPHP FUSE é um mecanismo para conectar beans a
         * modelos posthoc. Os modelos são conectados aos beans
         * por meio de convenções de nomenclatura. Ações nos
         * beans resultarão em ações nos modelos.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class SimpleModel
        {
            /**
             * @var OODBBean.
             */
            protected $bean;

            /**
             * Usado por FUSE: a classe ModelHelper para conectar
             * um bean a um modelo. Este método carrega um bean
             * no modelo.
             *
             * @param OODBBean $bean bean para carregar.
             * @return void.
             */
            public function loadBean(OODBBean $bean)
            {
                $this->bean = $bean;
            }

            /**
             * Magic Getter para disponibilizar as propriedades
             * do bean no $this-scope.
             *
             * @observação este método retorna um valor, não uma
             *             referência ! Para obter uma referência,
             *             primeiro desembale o bean !
             *
             * @param string $prop Propriedade para obter.
             * @return mixed.
             */
            public function __get($prop)
            {
                return $this->bean->$prop;
            }

            /**
             * Magic Setter.
             * Define o valor diretamente como uma propriedade do bean.
             *
             * @param string $prop  Propriedade para definir o valor.
             * @param mixed  $value Valor para definir.
             * @return void.
             */
            public function __set($prop, $value)
            {
                $this->bean->$prop = $value;
            }

            /**
             * Implementação de isset. Implementa a função isset
             * para acesso semelhante a um array.
             *
             * @param  string $key Chave para verificar.
             * @return boolean.
             */
            public function __isset($key)
            {
                return isset($this->bean->$key);
            }

            /**
             * Encaixote o bean usando o modelo atual. Este método
             * envolve o bean atual neste modelo. Este método pode
             * ser alcançado usando FUSE através de um OODBBean
             * simples. O método retorna um modelo simples
             * RedBeanPHP. Isso é útil se você quiser confiar nas
             * dicas de tipo do PHP. Você pode encaixotar seus beans
             * antes de passá-los para funções ou métodos com
             * parâmetros digitados.
             *
             * Nota sobre beans vs modelos:
             * Use unbox para obter o bean que alimenta o modelo. Se
             * você quiser usar a funcionalidade do bean, você deve
             * sempre desempacotar primeiro. Embora algumas
             * funcionalidades (como magic get/set) estejam disponíveis
             * no modelo, elas são somente leitura. Para usar um modelo
             * como um RedBean OODBBean típico, você deve sempre
             * desempacotar o modelo em um bean. Os modelos destinam-se
             * a expor apenas a lógica de domínio adicionada pelo
             * desenvolvedor (lógica de negócios, sem lógica ORM).
             *
             * @return SimpleModel.
             */
            public function box()
            {
                return $this;
            }

            /**
             * Retire o bean do modelo. Este método retorna o
             * bean dentro do modelo.
             *
             * Observação sobre beans vs modelos:
             * Use unbox para obter o bean que alimenta o modelo.
             * Se você quiser usar a funcionalidade do bean, você deve
             * sempre desempacotar primeiro. Embora algumas funcionalidades
             * (como magic get/set) estejam disponíveis no modelo, elas são
             * somente leitura. Para usar um modelo como um RedBean OODBBean
             * típico, você deve sempre desempacotar o modelo em um bean. Os
             * modelos destinam-se a expor apenas a lógica de domínio
             * adicionada pelo desenvolvedor (lógica de negócios, sem lógica
             * ORM).
             *
             * @return OODBBean.
             */
            public function unbox()
            {
                return $this->bean;
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\Observer as Observer;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\Observable as Observable;


        /**
         * RedBean Model Helper.
         * Conecta beans aos modelos. Este é o núcleo do
         * chamado FUSE.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class SimpleModelHelper implements Observer
        {
            /**
             * É notificado por um observável. Este método desacopla
             * o sistema FUSE dos beans reais. Se ocorrer um evento
             * FUSE "update", este método tentará invocar o método
             * correspondente no bean.
             *
             * @param string   $eventName Exemplo: "delete", "after_delete".
             * @param OODBBean $bean      Bean afetado.
             *
             * @return void
             */
            public function onEvent($eventName, $bean)
            {
                $bean->$eventName();
            }

            /**
             * Anexa os ouvintes de eventos FUSE. Agora o Model Helper
             * escutará eventos CRUD. Se ocorrer um evento CRUD, ele
             * enviará um sinal para o modelo que pertence ao bean
             * CRUD e este modelo assumirá o controle a partir daí.
             * Este método anexará os seguintes ouvintes de eventos
             * ao observável:
             *     - "update"       (É chamado por R::store, antes que os
             *                       registros sejam inseridos/atualizados).
             *     - "after_update" (É chamado por R::store, após os registros
             *                       terem sido inseridos/atualizados).
             *     - "open"         (É chamado por R::load, após o registro
             *                       ter sido recuperado).
             *     - "delete"       (É chamado por R::trash, antes da exclusão
             *                       do registro).
             *     - "after_delete" (É chamado por R::trash, após exclusão).
             *     - "dispense"     (É chamado por R::dispense).
             *
             * Para cada tipo de evento, este método registrará este
             * auxiliar como ouvinte. O observável notificará o
             * ouvinte (este objeto) com o ID do evento e o bean
             * afetado. Este auxiliar irá então processar o
             * evento (onEvent) invocando o evento no bean. Se um bean
             * oferecer um método com o mesmo nome do ID do evento,
             * esse método será invocado.
             *
             * @param Observable $observable Objeto a observar.
             * @return void.
             */
            public function attachEventListeners(Observable $observable)
            {
                foreach (array("update", "open", "delete", "after_delete", "after_update", "dispense") as $eventID)
                {
                    $observable->addEventListener(
                        $eventID,
                        $this
                    );
                }
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\ToolBox as ToolBox;
        use RedBeanPHP\AssociationManager as AssociationManager;
        use RedBeanPHP\OODBBean as OODBBean;


        /**
         * RedBeanPHP Tag Manager.
         * O gerenciador de tags oferece uma maneira fácil de
         * implementar rapidamente a funcionalidade básica de
         * marcação. Fornece métodos para marcar beans e
         * realizar pesquisas baseadas em tags no banco de
         * dados de beans.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class TagManager
        {
            /**
             * @var ToolBox.
             */
            protected $toolbox;

            /**
             * @var AssociationManager.
             */
            protected $associationManager;

            /**
             * @var OODB.
             */
            protected $redbean;

            /**
             * Verifica se o argumento é uma string separada por
             * vírgula; neste caso, dividirá a string em palavras
             * e retornará um array. No caso de um array, o
             * argumento será retornado "como está".
             *
             * @param array|string|false $tagList Lista de tags.
             * @return array.
             */
            private function extractTagsIfNeeded($tagList)
            {
                if ($tagList !== false && !is_array($tagList))
                {
                    $tags = explode(",", (string) $tagList);
                } else
                {
                    $tags = $tagList;
                }

                return $tags;
            }

            /**
             * Encontra um bean de tag pelo seu título.
             * Método interno.
             *
             * @param string $title Título a ser pesquisado.
             * @return OODBBean|NULL.
             */
            protected function findTagByTitle($title)
            {
                $beans = $this->redbean->find(
                    "tag",
                    array(
                        "title" => array(
                            $title
                        )
                    )
                );

                if ($beans)
                {
                    $bean = reset($beans);

                    return $bean;
                }

                return NULL;
            }

            /**
             * Construtor.
             * O gerenciador de tags oferece uma maneira fácil
             * de implementar rapidamente a funcionalidade
             * básica de marcação.
             *
             * @param ToolBox $toolbox Objeto de caixa de ferramentas.
             */
            public function __construct(ToolBox $toolbox)
            {
                $this->toolbox = $toolbox;
                $this->redbean = $toolbox->getRedBean();
                $this->associationManager = $this->redbean->getAssociationManager();
            }

            /**
             * Testa se um bean foi associado a uma ou mais
             * tags listadas. Se o terceiro parâmetro for true,
             * este método retornará true somente se todas as
             * tags que foram especificadas estiverem de fato
             * associadas ao bean fornecido, caso contrário,
             * false. Se o terceiro parâmetro for false, este
             * método retornará true se uma das tags corresponder,
             * false se nenhuma corresponder.
             *
             * A lista de tags pode ser um vetor com nomes de tags
             * ou uma lista separada por vírgulas de nomes de tags.
             *
             * Uso:
             *     <code>
             *         R::hasTag($blog, "horror,movie", true);
             *     </code>
             *
             * O exemplo acima retorna true se o bean $blog tiver
             * sido marcado como terror e filme. Se a postagem tiver
             * sido marcada apenas como "filme" ou "terror" esta
             * operação retornará false porque o terceiro parâmetro
             * foi definido como true.
             *
             * @param  OODBBean     $bean Bean para verificar tags.
             * @param  array|string $tags List de tags.
             * @param  boolean      $all  Se todos devem corresponder ou
             *                            apenas alguns.
             * @return boolean.
             */
            public function hasTag($bean, $tags, $all = false)
            {
                $foundtags = $this->tag($bean);
                $tags = $this->extractTagsIfNeeded($tags);
                $same = array_intersect($tags, $foundtags);

                if ($all)
                {
                    return (
                        implode(",", $same) === implode(",", $tags)
                    );
                }

                return (bool) (count($same) > 0);
            }

            /**
             * Remove todas as tags especificadas do bean. As tags
             * especificadas no segundo parâmetro não estarão mais
             * associadas ao bean. A lista de tags pode ser um vetor
             * com nomes de tags ou uma lista separada por vírgulas
             * de nomes de tags.
             *
             * Uso:
             *     <code>
             *         R::untag($blog, "smart,interesting");
             *     </code>
             *
             * No exemplo acima, o bean $blog não estará mais
             * associado às tags "smart" e "interesting".
             *
             * @param  OODBBean     $bean    Bean marcado.
             * @param  array|string $tagList Lista de tags (nomes).
             * @return void.
             */
            public function untag($bean, $tagList)
            {
                $tags = $this->extractTagsIfNeeded($tagList);
                foreach ($tags as $tag)
                {
                    if ($t = $this->findTagByTitle($tag))
                    {
                        $this->associationManager->unassociate(
                            $bean,
                            $t
                        );
                    }
                }
            }

            /**
             * Parte da API de marcação RedBeanPHP. Marca um bean
             * ou retorna tags associadas a um bean. Se $tagList
             * for NULL ou omitido, este método retornará uma
             * lista separada por vírgulas de tags associadas ao
             * bean fornecido. Se $tagList for uma lista separada
             * por vírgulas (string) de tags, todas as tags serão
             * associadas ao bean. Você também pode passar um array
             * em vez de uma string.
             *
             * Uso:
             *     <code>
             *         R::tag($meal, "TexMex,Mexican");
             *         $tags = R::tag($meal);
             *     </code>
             *
             * A primeira linha no exemplo acima marcará $meal
             * como "TexMex" e "Mexican Cuisine". A segunda linha
             * recuperará todas as tags anexadas ao objeto refeição.
             *
             * @param OODBBean $bean    Bean para tag.
             * @param mixed    $tagList Tags a serem anexadas ao bean especificado.
             * @return string.
             */
            public function tag(OODBBean $bean, $tagList = NULL)
            {
                if (is_null($tagList))
                {
                    $tags = $bean->sharedTag;
                    $foundTags = array();

                    foreach ($tags as $tag)
                    {
                        $foundTags[] = $tag->title;
                    }

                    return $foundTags;
                }

                $this->associationManager->clearRelations($bean, "tag");
                $this->addTags($bean, $tagList);

                return $tagList;
            }

            /**
             * Parte da API de marcação RedBeanPHP. Adiciona tags
             * a um bean. Se $tagList for uma lista de tags separadas
             * por vírgula, todas as tags serão associadas ao bean.
             * Você também pode passar um array em vez de uma
             * string.
             *
             * Uso:
             *     <code>
             *         R::addTags($blog, ["halloween"]);
             *     </code>
             *
             * O exemplo adiciona a tag "halloween" ao bean $blog.
             *
             * @param OODBBean           $bean    Bean para tag.
             * @param array|string|false $tagList Lista de tags para adicionar ao bean.
             * @return void.
             */
            public function addTags(OODBBean $bean, $tagList)
            {
                $tags = $this->extractTagsIfNeeded($tagList);

                if ($tagList === false)
                {
                    return;
                }

                foreach ($tags as $tag)
                {
                    if (!$t = $this->findTagByTitle($tag))
                    {
                        $t = $this->redbean->dispense("tag");
                        $t->title = $tag;

                        $this->redbean->store($t);
                    }

                    $this->associationManager->associate(
                        $bean,
                        $t
                    );
                }
            }

            /**
             * Retorna todos os beans que foram marcados com uma
             * ou mais das tags especificadas. A lista de tags
             * pode ser um vetor com nomes de tags ou uma lista
             * separada por vírgulas de nomes de tags.
             *
             * Uso:
             *     <code>
             *         $watchList = R::tagged(
             *             "movie",
             *             "horror,gothic",
             *             " ORDER BY movie.title DESC LIMIT ?",
             *             [ 10 ]
             *         );
             *     </code>
             *
             * O exemplo usa R::tagged() para encontrar todos os
             * filmes que foram marcados como "horror" ou "gótico",
             * ordená-los por título e limitar o número de filmes
             * a serem retornados a 10.
             *
             * @param string       $beanType Tipo de bean que você procura.
             * @param array|string $tagList  Lista de tags para corresponder.
             * @param string       $sql      SQL adicional (use apenas para paginação).
             * @param array        $bindings Ligações.
             * @return array.
             */
            public function tagged($beanType, $tagList, $sql = "", $bindings = array())
            {
                $tags = $this->extractTagsIfNeeded($tagList);
                $records = $this
                    ->toolbox
                    ->getWriter()
                    ->queryTagged(
                        $beanType,
                        $tags, false,
                        $sql,
                        $bindings
                    );

                return $this->redbean->convertToBeans(
                    $beanType,
                    $records
                );
            }

            /**
             * Retorna todos os beans que foram marcados com TODAS
             * as tags fornecidas. Este método funciona da mesma
             * forma que R::tagged() exceto que este método retorna
             * apenas beans que foram marcados com todos os rótulos
             * especificados. A lista de tags pode ser um vetor com
             * nomes de tags ou uma lista separada por vírgulas de
             * nomes de tags.
             *
             * Uso:
             *     <code>
             *         $watchList = R::taggedAll(
             *             "movie",
             *             [
             *                 "gothic",
             *                 "short"
             *             ],
             *             " ORDER BY movie.id DESC LIMIT ? ",
             *             [ 4 ]
             *         );
             *     </code>
             *
             * O exemplo acima retorna no máximo 4 filmes (devido à
             * cláusula LIMIT no SQL Query Snippet) que foram
             * marcados como BOTH "short" E "gothic".
             *
             * @param string       $beanType Tipo de feijão que você procura.
             * @param array|string $tagList  Lista de tags para corresponder.
             * @param string       $sql      Trecho sql adicional.
             * @param array        $bindings Ligações.
             * @return array.
             */
            public function taggedAll($beanType, $tagList, $sql = "", $bindings = array())
            {
                $tags = $this->extractTagsIfNeeded($tagList);
                $records = $this
                    ->toolbox
                    ->getWriter()
                    ->queryTagged(
                        $beanType,
                        $tags, true,
                        $sql,
                        $bindings
                    );

                return $this->redbean->convertToBeans(
                    $beanType,
                    $records
                );
            }

            /**
             * Como taggedAll() mas apenas conta.
             *
             * @see taggedAll.
             * @param string       $beanType Tipo de bean que você procura.
             * @param array|string $tagList  Lista de tags para corresponder.
             * @param string       $sql      Trecho sql adicional.
             * @param array        $bindings Ligações.
             * @return integer.
             */
            public function countTaggedAll($beanType, $tagList, $sql = "", $bindings = array())
            {
                $tags  = $this->extractTagsIfNeeded($tagList);

                return $this
                    ->toolbox
                    ->getWriter()
                    ->queryCountTagged(
                        $beanType,
                        $tags, true,
                        $sql,
                        $bindings
                    );
            }

            /**
             * Como tagged() mas apenas conta.
             *
             * @see tagged.
             * @param string       $beanType Tipo de bean que você procura.
             * @param array|string $tagList  Lista de tags para corresponder.
             * @param string       $sql      Trecho sql adicional.
             * @param array        $bindings Ligações.
             * @return integer.
             */
            public function countTagged($beanType, $tagList, $sql = "", $bindings = array())
            {
                $tags  = $this->extractTagsIfNeeded($tagList);

                return $this
                    ->toolbox
                    ->getWriter()
                    ->queryCountTagged(
                        $beanType,
                        $tags, false,
                        $sql,
                        $bindings
                    );
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\ToolBox as ToolBox;
        use RedBeanPHP\OODBBean as OODBBean;


        /**
         * Máquina de etiquetar. Faz os chamados beans rótulo.
         * Um rótulo é um bean com apenas uma propriedade id,
         * type e name. Os rótulos podem ser usados para criar
         * entidades simples como categorias, tags ou enumerações.
         * Esta classe de serviço fornece métodos convenientes
         * para lidar com esse tipo de bean.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class LabelMaker
        {
            /**
             * @var ToolBox.
             */
            protected $toolbox;

            /**
             * Construtor.
             *
             * @param ToolBox $toolbox.
             */
            public function __construct(ToolBox $toolbox)
            {
                $this->toolbox = $toolbox;
            }

            /**
             * Um rótulo é um bean com apenas uma propriedade id,
             * type e name. Esta função distribuirá beans para
             * todas as entradas do array. Os valores do array
             * serão atribuídos à propriedade name de cada
             * bean individual.
             *
             * <code>
             *     $people = R::dispenseLabels(
             *         "person",
             *         [
             *             "Santa",
             *             "Claus"
             *         ]
             *     );
             * </code>
             *
             * @param string $type   Tipo de bean que você gostaria de comer.
             * @param array  $labels Lista de rótulos, nomes para cada bean.
             * @return array.
             */
            public function dispenseLabels($type, $labels)
            {
                $labelBeans = array();
                foreach ($labels as $label)
                {
                    $labelBean = $this->toolbox->getRedBean()->dispense($type);
                    $labelBean->name = $label;
                    $labelBeans[] = $labelBean;
                }

                return $labelBeans;
            }

            /**
             * Reúne rótulos de bean. Esta função percorre os beans,
             * coleta o valor da propriedade name para cada bean
             * individual e armazena os nomes em um novo array. O
             * array então é classificado usando a função de
             * classificação padrão do PHP (sort).
             *
             * Uso:
             *     <code>
             *         $o1->name = "hamburger";
             *         $o2->name = "pizza";
             *
             *         //
             *         // hamburger,pizza.
             *         //
             *         implode(",", R::gatherLabels([$o1, $o2]));
             *     </code>
             *
             * Observe que o valor de retorno é um vetor de
             * strings, não de beans.
             *
             * @param array $beans Lista de beans para percorrer.
             * @return array.
             */
            public function gatherLabels($beans)
            {
                $labels = array();
                foreach ($beans as $bean)
                {
                    $labels[] = $bean->name;
                }

                sort($labels);

                return $labels;
            }

            /**
             * Busca um ENUM do banco de dados e o cria, se necessário.
             * Um ENUM tem o seguinte formato:
             *     <code>
             *         ENUM:VALUE
             *     </code>
             *
             * Se você passar apenas "ENUM", este método retornará
             * um array com seus valores:
             *     <code>
             *         //
             *         // "BANANA,MOCCA".
             *         //
             *         implode(
             *             ",",
             *             R::gatherLabels(
             *                 R::enum(
             *                     "flavour"
             *                 )
             *             )
             *         );
             *     </code>
             *
             * Se você passar "ENUM:VALUE" este método retornará
             * o bean enum especificado e o criará no banco de
             * dados se ainda não existir:
             *     <code>
             *         $bananaFlavour = R::enum("flavour:banana");
             *         $bananaFlavour->name;
             *     </code>
             *
             * Então você pode usar este método para definir um
             * valor ENUM em um bean:
             *     <code>
             *         $shake->flavour = R::enum("flavour:banana");
             *     </code>
             *
             * A propriedade sabor agora contém o bean enum, um
             * bean pai. No banco de dados, flavour_id apontará
             * para o registro de sabor com o nome "banana".
             *
             * @param string $enum ENUM Especificação para etiqueta.
             * @return array|OODBBean.
             */
            public function enum($enum)
            {
                $oodb = $this->toolbox->getRedBean();

                if (strpos($enum, ":") === false)
                {
                    $type = $enum;
                    $value = false;
                } else
                {
                    list(
                        $type,
                        $value
                    ) = explode(":", $enum);

                    $value = preg_replace(
                        '/\W+/',
                        "_",
                        strtoupper(
                            trim(
                                $value
                            )
                        )
                    );
                }

                /**
                 * Usamos simplesmente find aqui, poderíamos usar inspect()
                 * no modo fluido, etc., mas isso seria inútil. À primeira
                 * vista parece limpo, você pode até incorporar isso em
                 * find(), no entanto, find não só tem que lidar com o tipo
                 * de pesquisa principal, as pessoas também podem incluir
                 * referências na parte SQL, portanto, evitar falhas de
                 * localização não importa, isso ainda é a maneira mais
                 * rápida de usar as funcionalidades existentes.
                 *
                 * @observação Parece haver um bug no XDebug v2.3.2
                 * fazendo com que exceções suprimidas como essas
                 * apareçam de qualquer maneira, para evitar esse
                 * uso:
                 *
                 * "xdebug.default_enable = 0".
                 *
                 * Veja também o problema do Git #464.
                 */
                $values = $oodb->find($type);

                if ($value === false)
                {
                    return $values;
                }

                foreach($values as $enumItem)
                {
                    if ($enumItem->name === $value)
                    {
                        return $enumItem;
                    }
                }

                $newEnumItems = $this->dispenseLabels($type, array($value));
                $newEnumItem = reset($newEnumItems);
                $oodb->store($newEnumItem);

                return $newEnumItem;
            }
        }
    }

    /**
     *
     */
    namespace RedBeanPHP
    {
        use RedBeanPHP\QueryWriter as QueryWriter;
        use RedBeanPHP\Adapter\DBAdapter as DBAdapter;
        use RedBeanPHP\RedException\SQL as SQLException;
        use RedBeanPHP\Logger as Logger;
        use RedBeanPHP\Logger\RDefault as RDefault;
        use RedBeanPHP\Logger\RDefault\Debug as Debug;
        use RedBeanPHP\Adapter as Adapter;
        use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;
        use RedBeanPHP\RedException as RedException;
        use RedBeanPHP\BeanHelper\SimpleFacadeBeanHelper as SimpleFacadeBeanHelper;
        use RedBeanPHP\Driver\RPDO as RPDO;
        use RedBeanPHP\Util\MultiLoader as MultiLoader;
        use RedBeanPHP\Util\Transaction as Transaction;
        use RedBeanPHP\Util\Dump as Dump;
        use RedBeanPHP\Util\DispenseHelper as DispenseHelper;
        use RedBeanPHP\Util\ArrayTool as ArrayTool;
        use RedBeanPHP\Util\QuickExport as QuickExport;
        use RedBeanPHP\Util\MatchUp as MatchUp;
        use RedBeanPHP\Util\Look as Look;
        use RedBeanPHP\Util\Diff as Diff;
        use RedBeanPHP\Util\Tree as Tree;
        use RedBeanPHP\Util\Feature;


        /**
         * RedBean Facade.
         *
         * Informação de versão
         * RedBean versão @version 5.7.
         *
         * Esta classe esconde o cenário de objetos do RedBeanPHP
         * atrás de uma classe de letra única, fornecendo quase
         * todas as funcionalidades com chamadas estáticas
         * simples.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Facade
        {
            /**
             * RedBeanPHP version constant..
             */
            const C_REDBEANPHP_VERSION = "5.7";

            /**
             * @var ToolBox.
             */
            public static $toolbox;

            /**
             * @var OODB.
             */
            private static $redbean;

            /**
             * @var QueryWriter.
             */
            private static $writer;

            /**
             * @var Adapter.
             */
            private static $adapter;

            /**
             * @var AssociationManager.
             */
            private static $associationManager;

            /**
             * @var TagManager.
             */
            private static $tagManager;

            /**
             * @var DuplicationManager.
             */
            private static $duplicationManager;

            /**
             * @var LabelMaker.
             */
            private static $labelMaker;

            /**
             * @var Finder.
             */
            private static $finder;

            /**
             * @var Tree.
             */
            private static $tree;

            /**
             * @var Logger.
             */
            private static $logger;

            /**
             * @var callable[].
             */
            private static $plugins = array();

            /**
             * @var string.
             */
            private static $exportCaseStyle = "default";

            /**
             * @var bool Flag permite transações através de fachada
             *           em modo fluido.
             */
            private static $allowFluidTransactions = false;

            /**
             * @var bool Flag permite descongelar se necessário com
             *           store(all).
             */
            private static $allowHybridMode = false;

            /**
             * Não está em uso (compatibilidade com versões
             * anteriores SQLHelper).
             */
            public static $f;

            /**
             * @var string.
             */
            public static $currentDB = "";

            /**
             * @var ToolBox[].
             */
            public static $toolboxes = array();

            /**
             * Função Consulta Interna, executa a consulta desejada.
             * Usado por todas as funções de consulta de fachada.
             * Isso mantém as coisas SECAS.
             *
             * @param string $method   Método de consulta desejado (ou seja,
             *                         "célula", "col", "exec" etc.).
             * @param string $sql      O sql que você deseja executar.
             * @param array  $bindings Vetor de valores a serem vinculados à
             *                         instrução de consulta.
             * @return array|int|Cursor|NULL.
             */
            private static function query($method, $sql, $bindings)
            {
                if (!self::$redbean->isFrozen())
                {
                    try
                    {
                        $rs = Facade::$adapter->$method(
                            $sql,
                            $bindings
                        );
                    } catch (SQLException $exception)
                    {
                        if (self::$writer->sqlStateIn($exception->getSQLState(),
                            array(
                                QueryWriter::C_SQLSTATE_NO_SUCH_COLUMN,
                                QueryWriter::C_SQLSTATE_NO_SUCH_TABLE
                            ) ,$exception->getDriverDetails()))
                        {
                            return (
                                $method === "getCell"
                            ) ? NULL : array();
                        } else
                        {
                            throw $exception;
                        }
                    }

                    return $rs;
                } else
                {
                    return Facade::$adapter->$method(
                        $sql,
                        $bindings
                    );
                }
            }

            /**
             * Conjuntos permitem sinalizador de modo híbrido.
             * No modo híbrido (desativado por padrão), store/storeAll
             * recebe um argumento extra para alternar para o modo
             * fluido em caso de exceção. Você pode usar isso para
             * acelerar o modo fluido. Este método retorna o valor
             * anterior do sinalizador.
             *
             * @param boolean $hybrid.
             * @return bool.
             */
            public static function setAllowHybridMode($hybrid)
            {
                $old = self::$allowHybridMode;
                self::$allowHybridMode = $hybrid;

                return $old;
            }

            /**
             * Retorna a string da versão do RedBeanPHP. A string
             * da versão do RedBeanPHP sempre tem o mesmo formato
             * "X.Y", onde X é o número da versão principal e Y é
             * o número da versão secundária. Lançamentos pontuais
             * não são mencionados na string de versão.
             *
             * @return string.
             */
            public static function getVersion()
            {
                return self::C_REDBEANPHP_VERSION;
            }

            /**
             * Retorna a string da versão do servidor de banco
             * de dados.
             *
             * @return string.
             */
            public static function getDatabaseServerVersion()
            {
                return self::$adapter->getDatabaseServerVersion();
            }

            /**
             * Testa a conexão com o banco de dados. Retorna true
             * se a conexão tiver sido estabelecida e false caso
             * contrário. Suprime quaisquer avisos que possam
             * ocorrer durante o processo de teste e captura todas
             * as exceções que possam ser lançadas durante o
             * teste.
             *
             * @return boolean.
             */
            public static function testConnection()
            {
                if (!isset(self::$adapter))
                {
                    return false;
                }

                /**
                 *
                 */
                $database = self::$adapter->getDatabase();

                try
                {
                    @$database->connect();
                } catch (\Exception $e)
                {
                }

                return $database->isConnected();
            }

            /**
             * Kickstarts redbean para você. Este método deve ser
             * chamado antes de você começar a usar o RedBeanPHP.
             * O método Setup() pode ser chamado sem nenhum argumento,
             * neste caso ele tentará criar um banco de dados SQLite
             * em /tmp chamado red.db (isso só funciona em sistemas
             * do tipo UNIX).
             *
             * Uso:
             *     <code>
             *         R::setup("mysql:host=localhost;dbname=mydatabase", "dba", "dbapassword");
             *     </code>
             *
             * Você pode substituir "mysql:" pelo nome do banco de
             * dados que deseja usar. Os valores possíveis são:
             *     - pgsql  (PostgreSQL database).
             *     - sqlite (SQLite database).
             *     - mysql  (MySQL database).
             *     - sqlsrv (MS SQL Server - driver experimental apoiado pela comunidade).
             *     - CUBRID (CUBRID driver - suporte básico fornecido pelo Plugin).
             *
             * Observe que setup() não estabelecerá imediatamente
             * uma conexão com o banco de dados. Em vez disso, ele
             * preparará a conexão e conectará "preguiçosamente",
             * ou seja, no momento em que uma conexão for realmente
             * necessária, por exemplo, ao tentar carregar um bean.
             *
             * @param string|\PDO|NULL $dsn          Cadeia de conexão do banco de dados.
             * @param string|NULL      $username     Username para database.
             * @param string|NULL      $password     Password para database.
             * @param boolean|string[] $frozen       true se você deseja configurar no modo congelado.
             * @param boolean|string[] $partialBeans true para ativar atualizações parciais de beans.
             * @param array            $options      Opções adicionais (PDO) para passar.
             * @return ToolBox.
             */
            public static function setup($dsn = NULL, $username = NULL, $password = NULL, $frozen = false, $partialBeans = false, $options = array())
            {
                if (is_null($dsn))
                {
                    $dsn = "sqlite:" . DIRECTORY_SEPARATOR . sys_get_temp_dir() . DIRECTORY_SEPARATOR . "red.db";
                }

                self::addDatabase("default", $dsn, $username, $password, $frozen, $partialBeans, $options);
                self::selectDatabase("default");

                return self::$toolbox;
            }

            /**
             * Alterna o "Modo de campo estreito". No modo Campo
             * Estreito, o método queryRecord restringirá seu
             * campo de seleção para:
             *     <code>
             *         SELECT {table}.*
             *     </code>
             *
             * Em vez de:
             *     <code>
             *         SELECT *
             *     </code>
             *
             * Esta é uma maneira melhor de consultar porque permite
             * mais flexibilidade (por exemplo, junções). No entanto,
             * se você precisar de um seletor amplo para compatibilidade
             * com versões anteriores; use este método para desligar o
             * modo de campo estreito passando false. O padrão é true.
             *
             * @param boolean $narrowField true = Narrow Field false = Wide Field.
             * @return void.
             */
            public static function setNarrowFieldMode($mode)
            {
                AQueryWriter::setNarrowFieldMode($mode);
            }

            /**
             * Alterna transações fluidas. Por padrão, as transações
             * fluidas não estão ativas. Iniciar, confirmar ou reverter
             * uma transação através da fachada no modo fluido não terá
             * efeito. Se você deseja substituir esse comportamento
             * portátil padrão por um comportamento que depende de
             * como a plataforma de banco de dados usada lida com
             * transações fluidas (DDL), defina esse sinalizador
             * como true.
             *
             * @param boolean $mode Permitir modo de transação fluido.
             * @return void.
             */
            public static function setAllowFluidTransactions($mode)
            {
                self::$allowFluidTransactions = $mode;
            }

            /**
             * Alterna o suporte para condições IS-NULL. Se as
             * condições IS-NULL estiverem habilitadas, vetor
             * de condições para funções incluindo findLike()
             * serão tratadas de forma que "field" => NULL
             * será interpretado como field IS NULL em vez de
             * ser ignorado. Retorna o valor anterior do
             * sinalizador.
             *
             * @param boolean $flag true ou false.
             * @return boolean.
             */
            public static function useISNULLConditions($mode)
            {
                /**
                 * Caso contrário, as mesmas consultas poderão
                 * falhar (consulte Teste de unidade XNull).
                 */
                self::getWriter()->flushCache();

                /**
                 *
                 */
                return AQueryWriter::useISNULLConditions($mode);
            }

            /**
             * Envolve uma transação em torno de um fechamento ou retorno
             * de chamada de string. Se uma exceção for lançada internamente,
             * a operação será automaticamente revertida. Se nenhuma exceção
             * acontecer, ele será confirmado automaticamente. Ele também
             * suporta transações aninhadas (simuladas) (o que é útil quando
             * você tem muitos métodos que precisam de transações, mas não
             * têm conhecimento uns dos outros).
             *
             * Exemplo:
             *     <code>
             *         $from = 1;
             *         $to = 2;
             *         $amount = 300;
             *
             *         R::transaction(function() use($from, $to, $amount)
             *         {
             *             $accountFrom = R::load("account", $from);
             *             $accountTo = R::load("account", $to);
             *             $accountFrom->money -= $amount;
             *             $accountTo->money += $amount;
             *
             *             R::store($accountFrom);
             *             R::store($accountTo);
             *         });
             *     </code>
             *
             * @param callable $callback Fechamento (ou outro chamável)
             *                           com a lógica da transação.
             * @return mixed.
             */
            public static function transaction($callback)
            {
                if (!self::$allowFluidTransactions && !self::$redbean->isFrozen())
                {
                    return false;
                }

                return Transaction::transaction(self::$adapter, $callback);
            }

            /**
             * Adiciona um banco de dados à fachada, depois você
             * pode selecionar o banco de dados usando selectDatabase($key),
             * onde $key é o nome que você atribuiu a este banco
             * de dados.
             *
             * Uso:
             *     <code>
             *         R::addDatabase("database-1", "sqlite:/tmp/db1.txt");
             *
             *         //
             *         // Para selecionar o banco de dados novamente.
             *         //
             *         R::selectDatabase("database-1");
             *     </code>
             *
             * Este método permite adicionar (e selecionar) dinamicamente
             * novos bancos de dados à fachada. Adicionar um banco de dados
             * com a mesma chave causará uma exceção.
             *
             * @param string          $key          ID para o database.
             * @param string|\PDO     $dsn          DSN para o database.
             * @param string|NULL     $user         user para conexão.
             * @param string|NULL     $pass         password para conexão.
             * @param bool|string[]   $frozen       se este banco de dados está
             *                                      congelado ou não.
             * @param bool|string[]   $partialBeans devemos carregar beans
             *                                      parciais ?
             * @param array           $options      opções adicionais para o
             *                                      gravador de consultas.
             * @param BeanHelper|NULL $beanHelper   Beanhelper a ser usado (use
             *                                      isto para prefixos de modelo
             *                                      específicos do banco de
             *                                      dados).
             * @return void.
             */
            public static function addDatabase($key, $dsn, $user = NULL, $pass = NULL, $frozen = false, $partialBeans = false, $options = array(), $beanHelper = NULL)
            {
                if (isset(self::$toolboxes[$key]))
                {
                    throw new RedException(
                        "A database has already been specified for this key."
                    );
                }

                self::$toolboxes[$key] = self::createToolbox(
                    $dsn,
                    $user,
                    $pass,
                    $frozen,
                    $partialBeans,
                    $options
                );

                if (!is_null($beanHelper))
                {
                    self::$toolboxes[$key]
                        ->getRedBean()
                        ->setBeanHelper(
                            $beanHelper
                        );
                }
            }

            /**
             * Cria uma caixa de ferramentas. Este método pode ser
             * chamado se você quiser usar redbean não estático.
             * Possui a mesma interface que R::setup(). O método
             * createToolbox() pode ser chamado sem nenhum argumento,
             * neste caso ele tentará criar um banco de dados SQLite
             * em /tmp chamado red.db (isso só funciona em sistemas
             * do tipo UNIX).
             *
             * Uso:
             *     <code>
             *         R::createToolbox("mysql:host=localhost;dbname=mydatabase", "dba", "dbapassword");
             *     </code>
             *
             * Você pode substituir "mysql:" pelo nome do banco de dados
             * que deseja usar. Os valores possíveis são:
             *     - pgsql  (PostgreSQL database).
             *     - sqlite (SQLite database).
             *     - mysql  (MySQL database).
             *     - sqlsrv (MS SQL Server - driver experimental apoiado pela comunidade).
             *     - CUBRID (CUBRID driver - suporte básico fornecido pelo Plugin).
             *
             * Observe que createToolbox() não estabelecerá imediatamente
             * uma conexão com o banco de dados. Em vez disso, ele preparará
             * a conexão e conectará "preguiçosamente", ou seja, no momento
             * em que uma conexão for realmente necessária, por exemplo, ao
             * tentar carregar um bean.
             *
             * @param string|\PDO      $dsn          Cadeia de conexão do banco de dados.
             * @param string           $username     Username para database.
             * @param string           $password     Password para database.
             * @param boolean|string[] $frozen       true se você deseja configurar no modo congelado.
             * @param boolean|string[] $partialBeans true para ativar atualizações parciais de beans.
             * @param array            $options.
             * @return ToolBox.
             */
            public static function createToolbox($dsn, $username = NULL, $password = NULL, $frozen = false, $partialBeans = false, $options = array())
            {
                if (is_object($dsn))
                {
                    $db = new RPDO($dsn);
                    $dbType = $db->getDatabaseType();
                } else
                {
                    $db = new RPDO($dsn, $username, $password, $options);
                    $dbType = substr($dsn, 0, strpos($dsn, ":"));
                }

                $adapter = new DBAdapter($db);
                $writers = array(
                    "pgsql"  => "PostgreSQL",
                    "sqlite" => "SQLiteT",
                    "cubrid" => "CUBRID",
                    "mysql"  => "MySQL",
                    "sqlsrv" => "SQLServer",
                );

                $wkey = trim(strtolower($dbType));
                if (!isset($writers[$wkey]))
                {
                    $wkey = preg_replace('/\W/', "", $wkey);

                    /**
                     *
                     */
                    throw new RedException(
                        "Unsupported database (".$wkey.")."
                    );
                }

                /**
                 *
                 */
                $writerClass = "\\RedBeanPHP\\QueryWriter\\".$writers[$wkey];

                /**
                 * @var AQueryWriter $writer.
                 */
                $writer = new $writerClass($adapter);
                $redbean = new OODB($writer, $frozen);

                if ($partialBeans)
                {
                    $redbean
                        ->getCurrentRepository()
                        ->usePartialBeans(
                            $partialBeans
                        );
                }

                return new ToolBox(
                    $redbean,
                    $adapter,
                    $writer
                );
            }

            /**
             * Determina se um banco de dados identificado com a
             * chave especificada já foi adicionado à fachada. Esta
             * função retornará true se o banco de dados indicado
             * pela chave estiver disponível e false caso contrário.
             *
             * @param string $key A chave/nome do banco de dados a ser
             *                    verificado.
             * @return boolean.
             */
            public static function hasDatabase($key)
            {
                return (
                    isset(
                        self::$toolboxes[$key]
                    )
                );
            }

            /**
             * Seleciona um banco de dados diferente para o Facade
             * trabalhar. Se você usar R::setup() você não precisa
             * deste método. Este método destina-se a múltiplas
             * configurações de banco de dados. Este método
             * seleciona o banco de dados identificado pelo ID do
             * banco de dados ($key). Use addDatabase() para
             * adicionar um novo banco de dados, que por sua vez
             * pode ser selecionado usando selectDatabase(). Se
             * você usar R::setup(), o banco de dados resultante
             * será armazenado na chave "default", para voltar (voltar)
             * para este banco de dados use R::selectDatabase("default").
             * Este método retorna true se o banco de dados tiver sido
             * trocado e false caso contrário (por exemplo, se você já
             * estiver usando o banco de dados especificado).
             *
             * @param  string $key   Chave do banco de dados a ser selecionado.
             * @param  bool   $force.
             * @return boolean.
             */
            public static function selectDatabase($key, $force = false)
            {
                if (self::$currentDB === $key && !$force)
                {
                    return false;
                }

                if (!isset(self::$toolboxes[$key]))
                {
                    throw new RedException(
                        "Database not found in registry. Add database using R::addDatabase()."
                    );
                }

                self::configureFacadeWithToolbox(self::$toolboxes[$key]);
                self::$currentDB = $key;

                return true;
            }

            /**
             * Alterna o modo DEBUG. No modo de depuração, todo o
             * SQL que acontece nos bastidores será impresso na tela
             * e/ou registrado. Se nenhuma conexão com o banco de dados
             * tiver sido configurada usando R::setup() ou R::selectDatabase()
             * este método lançará uma exceção.
             *
             * Existem 2 estilos de depuração:
             *     Classic: Ligações de parâmetros separadas, explícitas
             *              e completas, mas menos legíveis.
             *     Fancy:   Ligações intercaladas, trunca cadeias grandes,
             *              alterações de esquema destacadas.
             *
             * O estilo sofisticado é mais legível, mas às vezes
             * incompleto. O primeiro parâmetro ativa ou desativa
             * a depuração. O segundo parâmetro indica o modo de
             * operação:
             *
             * 0 Registre e grave no estilo clássico STDOUT (padrão).
             * 1 Somente log, estilo de classe.
             * 2 Registre e escreva no estilo sofisticado STDOUT.
             * 3 Apenas registro, estilo sofisticado.
             *
             * Esta função sempre retorna a instância do logger criada
             * para gerar as mensagens de depuração.
             *
             * @param boolean $tf   Modo de depuração (true ou false).
             * @param integer $mode Modo da operação.
             *
             * @return RDefault.
             * @throws RedException.
             */
            public static function debug($tf = true, $mode = 0)
            {
                if ($mode > 1)
                {
                    $mode -= 2;
                    $logger = new Debug;
                } else
                {
                    $logger = new RDefault;
                }

                if (!isset(self::$adapter))
                {
                    throw new RedException(
                        "Use R::setup() first."
                    );
                }

                $logger->setMode($mode);
                self::$adapter
                    ->getDatabase()
                    ->setDebugMode(
                        $tf,
                        $logger
                    );

                return $logger;
            }

            /**
             * Ativa o depurador sofisticado. No modo "chique", o
             * depurador gerará consultas com parâmetros vinculados
             * dentro do próprio SQL. Este método foi adicionado para
             * oferecer uma maneira conveniente de ativar o sofisticado
             * sistema de depurador em uma chamada.
             *
             * @param boolean $toggle true para ativar o depurador e selecionar
             *                             o modo "chique".
             * @return void.
             */
            public static function fancyDebug($toggle = true)
            {
                self::debug($toggle, 2);
            }

            /**
             * Inspeciona o esquema do banco de dados. Se você passar
             * o tipo de um bean este método retornará os campos da
             * sua tabela no banco de dados. As chaves deste array
             * serão os nomes dos campos e os valores serão os tipos
             * de colunas usados para armazenar seus valores. Se
             * nenhum tipo for passado, este método retornará uma
             * lista de todas as tabelas do banco de dados.
             *
             * @param string|NULL $type Tipo de bean (ou seja, tabela) que
             *                          você deseja inspecionar ou NULL para
             *                          obter uma lista de todas as tabelas.
             * @return string[].
             */
            public static function inspect($type = NULL)
            {
                return (
                    $type === NULL
                ) ? self::$writer->getTables() : self::$writer->getColumns($type);
            }

            /**
             * Stores a bean in the database. This method takes a
             * OODBBean Bean Object $bean and stores it
             * in the database. If the database schema is not compatible
             * with this bean and RedBean runs in fluid mode the schema
             * will be altered to store the bean correctly.
             * If the database schema is not compatible with this bean and
             * RedBean runs in frozen mode it will throw an exception.
             * This function returns the primary key ID of the inserted
             * bean.
             *
             * The return value is an integer if possible. If it is not possible to
             * represent the value as an integer a string will be returned.
             *
             * Usage:
             *
             * <code>
             * $post = R::dispense("post");
             * $post->title = "my post";
             * $id = R::store( $post );
             * $post = R::load( "post", $id );
             * R::trash( $post );
             * </code>
             *
             * In the example above, we create a new bean of type "post".
             * We then set the title of the bean to "my post" and we
             * store the bean. The store() method will return the primary
             * key ID $id assigned by the database. We can now use this
             * ID to load the bean from the database again and delete it.
             *
             * If the second parameter is set to true and
             * Hybrid mode is allowed (default OFF for novice), then RedBeanPHP
             * will automatically temporarily switch to fluid mode to attempt to store the
             * bean in case of an SQLException.
             *
             * @param OODBBean|SimpleModel $bean             bean to store
             * @param boolean              $unfreezeIfNeeded retries in fluid mode in hybrid mode
             *
             * @return integer|string
             */
            public static function store($bean, $unfreezeIfNeeded = false)
            {
                $result = NULL;

                try
                {
                    $result = self::$redbean->store($bean);
                } catch (SQLException $exception)
                {
                    $wasFrozen = self::$redbean->isFrozen();
                    if (!self::$allowHybridMode || !$unfreezeIfNeeded)
                    {
                        throw $exception;
                    }

                    self::freeze(false);

                    $result = self::$redbean->store($bean);
                    self::freeze($wasFrozen);
                }

                return $result;
            }

            /**
             * Alterna o modo fluido ou congelado. No modo fluido,
             * a estrutura do banco de dados é ajustada para acomodar
             * seus objetos. No modo congelado, este não é o caso.
             *
             * Você também pode passar um array contendo uma seleção
             * de tipos congelados. Vamos chamar isso de modo frio,
             * é como o modo fluido, exceto que certos tipos (ou seja,
             * tabelas) não são tocados.
             *
             * @param boolean|string[] $tf modo de operação (true significa congelados).
             * @return void.
             */
            public static function freeze($tf = true)
            {
                self::$redbean->freeze($tf);
            }

            /**
             * Carrega vários tipos de beans com o mesmo ID. Este
             * pode parecer um método estranho, mas pode ser útil
             * para carregar uma relação um-para-um. Em uma relação
             * 1-1 típica, você tem dois registros compartilhando a
             * mesma chave primária. RedBeanPHP tem suporte limitado
             * apenas para relações 1-1. Em geral é recomendado usar
             * 1-N para isso.
             *
             * Uso:
             *     <code>
             *         list(
             *             $author,
             *             $bio
             *         ) = R::loadMulti("author, bio", $id);
             *     </code>
             *
             * @param string|string[] $types O conjunto de tipos a serem
             *                               carregados de uma vez.
             * @param int             $id    O ID comum.
             * @return OODBBean[].
             */
            public static function loadMulti($types, $id)
            {
                return MultiLoader::load(self::$redbean, $types, $id);
            }

            /**
             * Carrega um bean do banco de dados de objetos. Ele
             * procura um objeto Bean OODBBean no banco de dados.
             * Não importa como este bean foi armazenado. RedBean
             * usa o ID da chave primária $id e a string $type
             * para encontrar o bean. O $type especifica que tipo
             * de bean você está procurando; este é o mesmo tipo
             * usado com a função dispense(). Se o RedBean encontrar
             * o bean, ele retornará o objeto OODB Bean; se não
             * conseguir encontrar o bean, o RedBean retornará um
             * novo bean do tipo $type e com ID de chave primária
             * 0. Neste último caso, ele atua basicamente da mesma
             * forma que dispense().
             *
             * Observação importante:
             * Se o bean não puder ser encontrado no banco de dados,
             * um novo bean do tipo especificado será gerado e
             * retornado.
             *
             * Uso:
             *     <code>
             *         $post = R::dispense("post");
             *         $post->title = "my post";
             *         $id = R::store($post);
             *         $post = R::load("post", $id);
             *
             *         R::trash($post);
             *     </code>
             *
             * No exemplo acima, criamos um novo bean do tipo ‘post’.
             * Em seguida, definimos o título do bean como ‘my post’
             * e armazenamos o bean. O método store() retornará o ID
             * da chave primária $id atribuído pelo banco de dados.
             * Agora podemos usar esse ID para carregar o bean do
             * banco de dados novamente e excluí-lo.
             *
             * @param string      $type    Tipo de bean que você deseja carregar.
             * @param integer     $id      ID do bean que você deseja carregar.
             * @param string|NULL $snippet String a ser usada após a seleção (opcional).
             * @return OODBBean.
             */
            public static function load($type, $id, $snippet = NULL)
            {
                if ($snippet !== NULL)
                {
                    self::$writer->setSQLSelectSnippet($snippet);
                }

                /**
                 *
                 */
                $bean = self::$redbean->load($type, $id);

                /**
                 *
                 */
                return $bean;
            }

            /**
             * O mesmo que load, mas seleciona o bean para atualização,
             * bloqueando assim o bean. Isso equivale a uma consulta SQL
             * como "SELECT ... FROM ... FOR UPDATE". Use este método se
             * desejar carregar um bean que pretende ATUALIZAR. Este
             * método deve ser usado para "BLOQUEAR um bean".
             *
             * Uso:
             *     <code>
             *         $bean = R::loadForUpdate("bean", $id);
             *             ...update...
             *         R::store($bean);
             *     </code>
             *
             * @param string  $type Tipo de bean que você deseja carregar.
             * @param integer $id   ID do bean que você deseja carregar.
             * @return OODBBean.
             */
            public static function loadForUpdate($type, $id)
            {
                return self::load($type, $id, AQueryWriter::C_SELECT_SNIPPET_FOR_UPDATE);
            }

            /**
             * O mesmo que find(), mas seleciona os beans para
             * atualização, bloqueando assim os beans. Isso
             * equivale a uma consulta SQL como "SELECT ... FROM ... FOR UPDATE".
             * Use este método se desejar carregar um bean que
             * pretende ATUALIZAR. Este método deve ser usado
             * para "BLOQUEAR um bean".
             *
             * Uso:
             *     <code>
             *         $bean = R::findForUpdate(
             *             "bean",
             *             " title LIKE ? ",
             *             array(
             *                 "title"
             *             )
             *         );
             *
             *         ...update...
             *         R::store( $bean );
             *     </code>
             *
             * @param string      $type     O tipo de bean que você procura.
             * @param string|NULL $sql      Consulta SQL para encontrar o bean
             *                              desejado, começando logo após a
             *                              cláusula WHERE.
             * @param array       $bindings Array de valores a serem vinculados
             *                              aos parâmetros na consulta.
             * @return OODBBean[].
             */
            public static function findForUpdate($type, $sql = NULL, $bindings = array())
            {
                return self::find($type, $sql, $bindings, AQueryWriter::C_SELECT_SNIPPET_FOR_UPDATE);
            }

            /**
             * Método de conveniência. O mesmo que findForUpdate,
             * mas retorna apenas um bean e adiciona a cláusula LIMIT.
             *
             * @param string      $type     O tipo de bean que você procura.
             * @param string|NULL $sql      Consulta SQL para encontrar o bean
             *                              desejado, começando logo após a
             *                              cláusula WHERE.
             * @param array       $bindings Array de valores a serem vinculados
             *                              aos parâmetros na consulta.
             * @return OODBBean|NULL.
             */
            public static function findOneForUpdate($type, $sql = NULL, $bindings = array())
            {
                $sql = self::getWriter()->glueLimitOne($sql);
                $beans = self::findForUpdate($type, $sql, $bindings);

                return empty($beans) ? NULL : reset($beans);
            }

            /**
             * Remove um bean do banco de dados. Esta função
             * removerá o objeto Bean OODBBean especificado
             * do banco de dados.
             *
             * Este método de fachada também aceita uma combinação
             * de type-id; no último caso, este método tentará
             * carregar o bean especificado e ENTÃO descartá-lo.
             *
             * Uso:
             *     <code>
             *         $post = R::dispense("post");
             *         $post->title = "my post";
             *
             *         $id = R::store($post);
             *         $post = R::load("post", $id);
             *         R::trash($post);
             *     </code>
             *
             * No exemplo acima, criamos um novo bean do tipo ‘post’.
             * Em seguida, definimos o título do bean como ‘my post’
             * e armazenamos o bean. O método store() retornará o ID
             * da chave primária $id atribuído pelo banco de dados.
             * Agora podemos usar esse ID para carregar o bean do
             * banco de dados novamente e excluí-lo.
             *
             * @param string|OODBBean|SimpleModel $beanOrType Bean que você deseja
             *                                                remover do banco
             *                                                de dados.
             * @param integer                     $id         ID se o bean for
             *                                                descartado (opcional,
             *                                                apenas variante de ID
             *                                                de tipo).
             * @return int.
             */
            public static function trash($beanOrType, $id = NULL)
            {
                if (is_string($beanOrType))
                {
                    return self::trash(
                        self::load(
                            $beanOrType,
                            $id
                        )
                    );
                }

                return self::$redbean->trash(
                    $beanOrType
                );
            }

            /**
             * Dispensa um novo RedBean OODB Bean para uso com o
             * restante dos métodos. RedBeanPHP pensa em beans,
             * o bean é a principal forma de interagir com o
             * RedBeanPHP e o banco de dados gerenciado pelo
             * RedBeanPHP. Para carregar, armazenar e excluir
             * dados do banco de dados usando RedBeanPHP você
             * troca esses RedBeanPHP OODB Beans. A única exceção
             * a esta regra são os métodos de consulta bruta como
             * R::getCell() ou R::exec() e assim por diante. O
             * método dispense é a "maneira preferida" de criar
             * um novo bean.
             *
             * Uso:
             *     <code>
             *         $book = R::dispense("book");
             *         $book->title = "My Book";
             *         R::store($book);
             *     </code>
             *
             * Este método também pode ser usado para criar um gráfico
             * de bean inteiro de uma só vez. Dado um array com chaves
             * especificando os nomes das propriedades dos beans e uma
             * chave _type especial para indicar o tipo de bean, pode-se
             * fazer o Dispense Helper gerar uma hierarquia inteira de
             * beans, incluindo listas. Para fazer dispense() gerar uma
             * lista, basta adicionar uma chave como: ownXList ou
             * sharedXList onde X é o tipo de beans que ele contém e
             * definir seu valor para um array preenchido com arrays
             * representando os beans. Observe que, embora o tipo possa
             * ter sido sugerido no nome da lista, você ainda precisa
             * especificar uma chave _type para cada array de bean na
             * lista. Observe que, se você especificar um array para
             * gerar um gráfico de bean, o parâmetro number será
             * ignorado.
             *
             * Uso:
             *     <code>
             *         $book = R::dispense([
             *             "_type" => "book",
             *             "title" => "Gifted Programmers",
             *             "author" => ["_type" => "author", "name" => "Xavier"],
             *             "ownPageList" => [["_type" => "page", "text" => "..."]]
             *         ]);
             *     </code>
             *
             * @param string|OODBBean[] $typeOrBeanArray   Tipo ou vetor de bean
             *                                             a ser importada.
             * @param integer           $num               Número de grãos a
             *                                             dispensar.
             * @param boolean           $alwaysReturnArray Se true sempre retorna o
             *                                             resultado como um array.
             * @return OODBBean|OODBBean[].
             */
            public static function dispense($typeOrBeanArray, $num = 1, $alwaysReturnArray = false)
            {
                return DispenseHelper::dispense(
                    self::$redbean,
                    $typeOrBeanArray,
                    $num,
                    $alwaysReturnArray
                );
            }

            /**
             * Pega uma lista separada por vírgulas de tipos de
             * beans e distribui esses grãos. Para cada tipo da
             * lista é possível especificar a quantidade de grãos
             * a serem dispensados.
             *
             * Uso:
             *     <code>
             *         list(
             *             $book,
             *             $page,
             *             $text
             *         ) = R::dispenseAll("book,page,text");
             *     </code>
             *
             * Isso dispensará um livro, uma página e um texto.
             * Dessa forma, você pode dispensar rapidamente beans
             * de vários tipos em apenas uma linha de código.
             *
             * Uso:
             *     <code>
             *         list(
             *             $book,
             *             $pages
             *         ) = R::dispenseAll("book,page*100");
             *     </code>
             *
             * Isso retorna um array com um bean de livro e depois
             * outro array contendo 100 beans de página.
             *
             * @param string  $order      Uma descrição da ordem de distribuição
             *                            desejada usando a sintaxe acima.
             * @param boolean $onlyArrays Retorna apenas vetores, mesmo que
             *                            amount < 2.
             * @return array.
             */
            public static function dispenseAll($order, $onlyArrays = false)
            {
                return DispenseHelper::dispenseAll(self::$redbean, $order, $onlyArrays);
            }

            /**
             * Método de conveniência. Tenta encontrar beans de
             * um determinado tipo, se nenhum bean for encontrado,
             * dispensa um bean desse tipo. Observe que esta função
             * sempre retorna um array.
             *
             * @param  string      $type     Tipo de bean que você procura.
             * @param  string|NULL $sql      Código SQL para encontrar o bean.
             * @param  array       $bindings Parâmetros para vincular ao SQL.
             * @return OODBBean[].
             */
            public static function findOrDispense($type, $sql = NULL, $bindings = array())
            {
                DispenseHelper::checkType($type);
                return self::$finder->findOrDispense(
                    $type,
                    $sql,
                    $bindings
                );
            }

            /**
             * O mesmo que findOrDispense, mas retorna apenas
             * um elemento.
             *
             * @param  string      $type     Tipo de bean que você procura.
             * @param  string|NULL $sql      Código SQL para encontrar o bean.
             * @param  array       $bindings Parâmetros para vincular ao SQL.
             * @return OODBBean.
             */
            public static function findOneOrDispense($type, $sql = NULL, $bindings = array())
            {
                DispenseHelper::checkType($type);
                $arrayOfBeans = self::findOrDispense(
                    $type,
                    $sql,
                    $bindings
                );

                return reset($arrayOfBeans);
            }

            /**
             * Encontra beans usando um tipo e uma instrução SQL
             * opcional. Tal como acontece com a maioria das
             * ferramentas de consulta no RedBean, você pode
             * fornecer valores a serem inseridos na instrução
             * SQL preenchendo o parâmetro do vetor de valores;
             * você pode usar a notação de ponto de interrogação
             * ou a notação de slot (:keyname).
             *
             * Seu SQL não precisa começar com uma condição de
             * cláusula WHERE.
             *
             * @param string      $type     O tipo de bean que você procura.
             * @param string|NULL $sql      Consulta SQL para encontrar o bean
             *                              desejado, começando logo após a
             *                              cláusula WHERE.
             * @param array       $bindings Array de valores a serem vinculados
             *                              aos parâmetros na consulta.
             * @param string|NULL $snippet  Snippet SQL a ser incluído na
             *                              consulta (por exemplo: FOR UPDATE).
             *
             * @phpstan-param literal-string|null $sql.
             * @psalm-param   literal-string|null $sql.
             * @return OODBBean[].
             */
            public static function find($type, $sql = NULL, $bindings = array(), $snippet = NULL)
            {
                if ($snippet !== NULL)
                {
                    self::$writer->setSQLSelectSnippet($snippet);
                }

                return self::$finder->find(
                    $type,
                    $sql,
                    $bindings
                );
            }

            /**
             * Alias para find().
             *
             * @param string      $type     O tipo de bean que você procura.
             * @param string|NULL $sql      Consulta SQL para encontrar o bean
             *                              desejado, começando logo após a
             *                              cláusula WHERE.
             * @param array       $bindings Array de valores a serem vinculados
             *                              aos parâmetros na consulta.
             * @return OODBBean[].
             */
            public static function findAll($type, $sql = NULL, $bindings = array())
            {
                return self::$finder->find(
                    $type,
                    $sql,
                    $bindings
                );
            }

            /**
             * Como find() mas também exporta os beans como um
             * array. Este método executará uma operação de
             * localização. Para cada bean na coleção de resultados,
             * este método chamará o método export(). Este método
             * retorna um array contendo as representações de array
             * de cada bean no conjunto de resultados.
             *
             * @see Finder::find.
             * @param string      $type     type   O tipo de bean que você procura.
             * @param string|NULL $sql      sql    Consulta SQL para encontrar o
             *                                     bean desejado, começando logo
             *                                     após a cláusula WHERE.
             * @param array       $bindings values Array de valores a serem vinculados
             *                                     aos parâmetros na consulta.
             * @return array.
             */
            public static function findAndExport($type, $sql = NULL, $bindings = array())
            {
                return self::$finder
                    ->findAndExport(
                        $type,
                        $sql,
                        $bindings
                    );
            }

            /**
             * Como R::find() mas retorna apenas o primeiro bean.
             *
             * @param string      $type     O tipo de bean que você procura.
             * @param string|NULL $sql      Consulta SQL para encontrar o bean
             *                              desejado, começando logo após a
             *                              cláusula WHERE.
             * @param array       $bindings Array de valores a serem vinculados
             *                              aos parâmetros na consulta.
             * @return OODBBean|NULL.
             */
            public static function findOne($type, $sql = NULL, $bindings = array())
            {
                return self::$finder->findOne(
                    $type,
                    $sql,
                    $bindings
                );
            }

            /**
             * @deprecated
             *
             * Como find() mas retorna o último bean do vetor de
             * resultados. Oposto de Finder::findLast(). Se nenhum
             * bean for encontrado, este método retornará NULL.
             *
             * Por favor, não use esta função, ela é terrivelmente
             * ineficaz. Em vez disso, use uma cláusula ORDER BY
             * invertida e um LIMIT 1 com R::findOne(). Esta função
             * nunca deve ser usada e permanece apenas por uma
             * questão de compatibilidade com versões anteriores.
             *
             * @see Finder::find.
             * @param string      $type     O tipo de bean que você procura.
             * @param string|NULL $sql      Consulta SQL para encontrar o bean
             *                              desejado, começando logo após a
             *                              cláusula WHERE.
             * @param array       $bindings Array de valores a serem vinculados
             *                              aos parâmetros na consulta.
             * @return OODBBean|NULL.
             */
            public static function findLast($type, $sql = NULL, $bindings = array())
            {
                return self::$finder
                    ->findLast(
                        $type,
                        $sql,
                        $bindings
                    );
            }

            /**
             * Encontra um BeanCollection usando o repositório.
             * Uma coleção de beans pode ser usada para recuperar
             * um bean por vez usando cursors - isso é útil para
             * processar grandes conjuntos de dados. Uma coleção
             * de beans não carregará todos os beans na memória
             * de uma só vez, apenas um de cada vez.
             *
             * @param  string      $type     O tipo de bean que você procura.
             * @param  string|NULL $sql      Consulta SQL para encontrar o bean
             *                               desejado, começando logo após a
             *                               cláusula WHERE.
             * @param  array       $bindings Array de valores a serem vinculados
             *                               aos parâmetros na consulta.
             * @return BeanCollection.
             */
            public static function findCollection($type, $sql = NULL, $bindings = array())
            {
                return self::$finder->findCollection(
                    $type,
                    $sql,
                    $bindings
                );
            }

            /**
             * Retorna um hashmap com vetores de bean codificadas por
             * tipo usando uma consulta SQL como recurso. Dada uma
             * consulta SQL como "SELECT movie.*, review.* FROM movie... JOIN review"
             * este método retornará beans de filme e revisão.
             *
             * Exemplo:
             *     <code>
             *         $stuff = $finder->findMulti("movie,review", "
             *             SELECT movie.*, review.* FROM movie
             *             LEFT JOIN review ON review.movie_id = movie.id");
             *     </code>
             *
             * Após esta operação, $stuff conterá uma entrada "movie"
             * contendo todos os filmes e uma entrada chamada "review"
             * contendo todas as resenhas (todos os beans). Você também
             * pode passar ligações.
             *
             * Se você deseja remapear seus beans, para poder usar
             * $movie->ownReviewList sem que o RedBeanPHP execute
             * uma consulta SQL, você pode usar o quarto parâmetro
             * para definir uma seleção de fechamentos de
             * remapeamento.
             *
             * O argumento remapeamento (opcional) deve conter um
             * vetor de vetores. Cada vetor no vetor de remapeamento
             * deve conter as seguintes entradas:
             *
             * <code>
             *     array(
             *         "a"       => TYPE A
             *         "b"       => TYPE B
             *         "matcher" => MATCHING FUNCTION ACCEPTING A, B and ALL BEANS
             *         "do"      => OPERATION FUNCTION ACCEPTING A, B, ALL BEANS, ALL REMAPPINGS
             *     )
             * </code>
             *
             * Usando este mecanismo você pode construir seu
             * próprio "pré-carregador" com pequenos trechos
             * de funções (e esses podem ser reutilizados e
             * compartilhados online, é claro).
             *
             * Exemplo:
             *     <code>
             *         array(
             *             //
             *             // Defina A como filme.
             *             //
             *             "a" => "movie"
             *
             *             //
             *             // Defina B como revisão.
             *             //
             *             "b" => "review"
             *             "matcher" => function($a, $b)
             *             {
             *                 //
             *                 // Execute a ação se review.movie_id para
             *                 // igual a movie.id.
             *                 //
             *                 return ($b->movie_id == $a->id);
             *             }
             *
             *             "do" => function($a, $b)
             *             {
             *                 //
             *                 // Adicione a crítica ao filme.
             *                 //
             *                 $a->noLoad()->ownReviewList[] = $b;
             *
             *                 //
             *                 // Opcional, aja "como se esses beans tivessem
             *                 // sido carregados através de ownReviewList".
             *                 //
             *                 $a->clearHistory();
             *             }
             *         );
             *     </code>
             *
             * @observação a consulta SQL fornecida NÃO É A usada
             * internamente por esta função, esta função irá
             * pré-processar a consulta para obter todos os dados
             * necessários para encontrar os beans.
             *
             * @observação se você usar a notação "book.*",
             * certifique-se de que seu seletor comece com um
             * ESPAÇO. " book.*" NÃO ",book.*". Isso ocorre
             * porque na verdade é um modelo SLOT semelhante
             * ao SQL, não SQL real.
             *
             * @observação em vez de uma consulta SQL, você também
             * pode passar um vetor de resultados.
             *
             * @param string|string[]     $types      Uma lista de tipos (array
             *                                        ou string separada por
             *                                        vírgula).
             * @param string|array[]|NULL $sql        Uma consulta SQL ou um vetor
             *                                        de registros pré-buscados.
             * @param array               $bindings   Opcional, ligações para
             *                                        consulta SQL.
             * @param array[]             $remappings Opcional, um vetor de
             *                                        vetores de remapeamento.
             * @return array.
             */
            public static function findMulti($types, $sql, $bindings = array(), $remappings = array())
            {
                return self::$finder
                    ->findMulti(
                        $types,
                        $sql,
                        $bindings,
                        $remappings
                    );
            }

            /**
             * Retorna um vetor de beans. Passe um tipo e uma série
             * de ids e este método lhe trará os beans correspondentes.
             *
             * Observação importante: como este método carrega beans
             * usando a função load() (mas mais rápido), ele retornará
             * beans vazios com ID 0 para cada bean que não pôde ser
             * localizado. Os beans resultantes terão os IDs passados
             * como chaves.
             *
             * @param string $type Tipos de beans.
             * @param int[]  $ids  Ids para carregar.
             * @return OODBBean[].
             */
            public static function batch($type, $ids)
            {
                return self::$redbean->batch(
                    $type,
                    $ids
                );
            }

            /**
             * Alias para batch(). O método Batch é mais antigo,
             * mas como adicionamos os chamados métodos *All,
             * como storeAll, trashAll, dispenseAll e findAll,
             * parecia lógico melhorar a consistência da API
             * Facade e também adicionar um alias para batch()
             * chamado loadAll.
             *
             * @param string $type Tipo de beans
             * @param int[]  $ids  Ids para carregar.
             * @return OODBBean[].
             */
            public static function loadAll($type, $ids)
            {
                return self::$redbean->batch(
                    $type,
                    $ids
                );
            }

            /**
             * Função de conveniência para executar consultas
             * diretamente. Executa SQL.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Uma lista de valores a serem vinculados
             *                         aos parâmetros de consulta.
             * @return integer.
             */
            public static function exec($sql, $bindings = array())
            {
                return self::query("exec", $sql, $bindings);
            }

            /**
             * Função de conveniência para disparar uma consulta
             * SQL usando o adaptador de banco de dados RedBeanPHP.
             * Este método permite consultar diretamente o banco
             * de dados sem precisar obter primeiro uma instância
             * do adaptador de banco de dados. Executa a consulta
             * SQL especificada junto com as ligações de parâmetros
             * especificadas e retorna todas as linhas e colunas.
             *
             * @param string $sql      Consulta SQL a ser executada.
             * @param array  $bindings Uma lista de valores a serem vinculados
             *                         aos parâmetros de consulta.
             * @return string[][].
             */
            public static function getAll($sql, $bindings = array())
            {
                return self::query("get", $sql, $bindings);
            }

            /**
             * Função de conveniência para disparar uma consulta SQL
             * usando o adaptador de banco de dados RedBeanPHP. Este
             * método permite consultar diretamente o banco de dados
             * sem precisar obter primeiro uma instância do adaptador
             * de banco de dados. Executa a consulta SQL especificada
             * junto com as ligações de parâmetros especificadas e
             * retorna uma única célula.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Uma lista de valores a serem vinculados
             *                         aos parâmetros de consulta.
             * @return string|NULL.
             */
            public static function getCell($sql, $bindings = array())
            {
                return self::query("getCell", $sql, $bindings);
            }

            /**
             * Função de conveniência para disparar uma consulta SQL
             * usando o adaptador de banco de dados RedBeanPHP. Este
             * método permite consultar diretamente o banco de dados
             * sem precisar obter primeiro uma instância do adaptador
             * de banco de dados. Executa a consulta SQL especificada
             * junto com as ligações de parâmetros especificadas e
             * retorna uma instância PDOCursor.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Uma lista de valores a serem vinculados
             *                         aos parâmetros de consulta.
             * @return Cursor.
             */
            public static function getCursor($sql, $bindings = array())
            {
                return self::query("getCursor", $sql, $bindings);
            }

            /**
             * Função de conveniência para disparar uma consulta
             * SQL usando o adaptador de banco de dados RedBeanPHP.
             * Este método permite consultar diretamente o banco de
             * dados sem precisar obter primeiro uma instância do
             * adaptador de banco de dados. Executa a consulta SQL
             * especificada juntamente com as ligações de parâmetros
             * especificadas e retorna uma única linha.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Uma lista de valores a serem vinculados
             *                         aos parâmetros de consulta.
             * @return array|NULL.
             */
            public static function getRow($sql, $bindings = array())
            {
                return self::query("getRow", $sql, $bindings);
            }

            /**
             * Função de conveniência para disparar uma consulta
             * SQL usando o adaptador de banco de dados RedBeanPHP.
             * Este método permite consultar diretamente o banco de
             * dados sem precisar obter primeiro uma instância do
             * adaptador de banco de dados. Executa a consulta SQL
             * especificada junto com as ligações de parâmetros
             * especificadas e retorna uma única coluna.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Uma lista de valores a serem vinculados
             *                         aos parâmetros de consulta.
             * @return string[].
             */
            public static function getCol($sql, $bindings = array())
            {
                return self::query("getCol", $sql, $bindings);
            }

            /**
             * Função de conveniência para executar consultas
             * diretamente. Executa SQL. Os resultados serão
             * retornados como um vetor associativo. A primeira
             * coluna na cláusula select será usada para as
             * chaves nesse vetor e a segunda coluna será
             * usada para os valores. Se apenas uma coluna
             * for selecionada na consulta, tanto a chave
             * quanto o valor do array terão o valor deste
             * campo para cada linha.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Uma lista de valores a serem vinculados
             *                         aos parâmetros de consulta.
             * @return string[].
             */
            public static function getAssoc($sql, $bindings = array())
            {
                return self::query("getAssoc", $sql, $bindings);
            }

            /**
             * Função de conveniência para disparar uma consulta SQL
             * usando o adaptador de banco de dados RedBeanPHP. Este
             * método permite consultar diretamente o banco de dados
             * sem precisar obter primeiro uma instância do adaptador
             * de banco de dados. Executa a consulta SQL especificada
             * junto com as ligações de parâmetros especificadas e
             * retorna um vetor associativo. Os resultados serão
             * retornados como um array associativo indexado pela
             * primeira coluna da seleção.
             *
             * @param string $sql      Consulta SQL para executar.
             * @param array  $bindings Uma lista de valores a serem vinculados
             *                         aos parâmetros de consulta.
             * @return array.
             */
            public static function getAssocRow($sql, $bindings = array())
            {
                return self::query("getAssocRow", $sql, $bindings);
            }

            /**
             * Retorna o ID de inserção para bancos de dados que
             * suportam/exigem essa funcionalidade. Alias para
             * R::getAdapter()->getInsertID().
             *
             * @return int.
             */
            public static function getInsertID()
            {
                return self::$adapter->getInsertID();
            }

            /**
             * Faz uma cópia de um bean. Este método faz uma cópia
             * profunda do bean. A cópia terá os seguintes recursos.
             *     - Todos os beans nas listas próprias também serão duplicados.
             *     - Todas as referências aos beans compartilhados serão
             *       copiadas, mas não os próprios beans compartilhados.
             *     - Todas as referências a objetos pais (campos _id) serão
             *       copiadas, mas não os próprios pais.
             *
             * Na maioria dos casos este é o cenário desejado para copiar
             * beans. Esta função usa um trail-array para evitar recursão
             * infinita, se um bean recursivo for encontrado (ou seja, um
             * que já tenha sido processado) o ID do bean será retornado.
             * No entanto, isso não deveria acontecer.
             *
             * Observação:
             * Esta função faz uma consulta reflexiva ao banco de
             * dados, portanto pode ser lenta.
             *
             * @deprecated
             * Esta função está obsoleta em favor de R::duplicate().
             * Esta função possui uma assinatura de método confusa,
             * a função R::duplicate() aceita apenas dois
             * argumentos: bean e filters.
             *
             * @param OODBBean   $bean    Bean para ser copiado.
             * @param OODBBean[] $trail   Para uso interno, passe array().
             * @param boolean    $pid     Para uso interno.
             * @param array      $filters Filtro de lista branca com tipos de
             *                            bean para duplicar.
             * @return OODBBean.
             */
            public static function dup($bean, $trail = array(), $pid = false, $filters = array())
            {
                self::$duplicationManager->setFilters($filters);
                return self::$duplicationManager
                    ->dup(
                        $bean,
                        $trail,
                        $pid
                    );
            }

            /**
             * Faz uma cópia profunda de um bean. Este método faz
             * uma cópia profunda do bean. A cópia terá o seguinte:
             *     * Todos os beans nas listas próprias também serão
             *       duplicados.
             *     * Todas as referências aos beans compartilhados serão
             *       copiadas, mas não os próprios beans compartilhados.
             *     * Todas as referências a objetos pais (campos _id)
             *       serão copiadas, mas não os próprios pais.
             *
             * Na maioria dos casos este é o cenário desejado para
             * copiar beans. Esta função usa um trail-array para
             * evitar recursão infinita, se um bean recursivo for
             * encontrado (ou seja, um que já tenha sido processado)
             * o ID do bean será retornado. No entanto, isso não
             * deveria acontecer.
             *
             * Observação:
             * Esta função faz uma consulta reflexiva ao banco de dados,
             * portanto pode ser lenta.
             *
             * Observação:
             * Esta é uma versão simplificada da função obsoleta R::dup().
             *
             * @param OODBBean $bean    Bean a ser copiado.
             * @param array    $filters Filtro de lista branca com tipos de
             *                          bean para duplicar.
             * @return OODBBean.
             */
            public static function duplicate($bean, $filters = array())
            {
                return self::dup($bean, array(), false, $filters);
            }

            /**
             * Exporta uma coleção de beans. Útil para exportações
             * XML/JSON com uma estrutura Javascript como Dojo ou
             * ExtJS. O que será exportado:
             *     * Conteúdo do bean.
             *     * Todas as próprias listas de beans (recursivamente).
             *     * Todos os beans compartilhados (não SUAS próprias listas).
             *
             * @param OODBBean|OODBBean[] $beans   Bean a ser exportado.
             * @param boolean             $parents Se você deseja que os beans
             *                                     pais sejam exportados.
             * @param array               $filters Lista branca de tipos.
             * @param boolean             $meta    Exportar metadados também.
             * @return array[].
             */
            public static function exportAll($beans, $parents = false, $filters = array(), $meta = false)
            {
                return self::$duplicationManager
                    ->exportAll(
                        $beans,
                        $parents,
                        $filters, self::$exportCaseStyle,
                        $meta
                    );
            }

            /**
             * Seleciona o estilo do caso para exportação. Isto
             * determinará o estilo de caso para as chaves dos
             * beans exportados (consulte exportAll). As
             * seguintes opções são aceitas:
             *     * "default" RedBeanPHP por padrão aplica Snake Case (ou
             *                 seja, book_id is_valid).
             *     * "camel"   Camel Case (ou seja, bookId isValid).
             *     * "dolphin" Dolphin Case (ou seja, bookID isValid)
             *                 Como CamelCase, mas o ID é escrito em
             *                 letras maiúsculas.
             *
             * @warning RedBeanPHP transforma camelCase em snake_case
             * usando um algoritmo ligeiramente diferente, ele também
             * converte isACL em is_acl (não is_a_c_l) e bookID em
             * book_id. Devido à perda de informações, isso não pode
             * ser corrigido. No entanto, se você tentar o DolphinCase
             * para IDs, ele levará em consideração a exceção relativa
             * aos IDs.
             *
             * @param string $caseStyle Identificador de estilo de caso.
             * @return void.
             */
            public static function useExportCase($caseStyle = "default")
            {
                if (!in_array($caseStyle, array("default", "camel", "dolphin")))
                {
                    throw new RedException(
                        "Invalid case selected."
                    );
                }

                self::$exportCaseStyle = $caseStyle;
            }

            /**
             * Converte uma série de linhas em beans. Este método
             * converte uma série de linhas em beans. O tipo dos
             * beans de saída desejados pode ser especificado no
             * primeiro parâmetro. O segundo parâmetro destina-se
             * às linhas de resultados do banco de dados.
             *
             * Uso:
             *     <code>
             *         $rows = R::getAll("SELECT * FROM ...")
             *         $beans = R::convertToBeans($rows);
             *     </code>
             *
             * A partir da versão 4.3.2 você pode especificar uma
             * meta-máscara. Os dados das colunas com nomes começando
             * com o valor especificado na máscara serão transferidos
             * para a meta seção de um bean (em data.bundle).
             *
             * <code>
             *     $rows = R::getAll( "SELECT FROM... COUNT(*) AS extra_count ..." );
             *     $beans = R::convertToBeans( $rows, "extra_" );
             *     $bean = reset( $beans );
             *     $data = $bean->getMeta( "data.bundle" );
             *     $extra_count = $data["extra_count"];
             * </code>
             *
             * Novo no 4.3.2: metamáscara. A metamáscara é uma máscara
             * especial para enviar dados das linhas de resultados brutos
             * para o metastore do bean. Isso é útil para agrupar
             * informações adicionais com consultas personalizadas. Os
             * valores de cada coluna cujo nome começa com $mask serão
             * transferidos para a metaseção do bean na
             * chave "data.bundle".
             *
             * @param string            $type     Tipo de bean a ser produzido.
             * @param string[][]        $rows     Deve conter um vetor de vetores.
             * @param string|array|NULL $metamask Meta máscara a ser aplicada (opcional).
             * @return OODBBean[].
             */
            public static function convertToBeans($type, $rows, $metamask = NULL)
            {
                return self::$redbean
                    ->convertToBeans(
                        $type,
                        $rows,
                        $metamask
                    );
            }

            /**
             * Assim como convertToBeans, mas para um bean.
             *
             * @param string            $type     Tipo de bean a ser produzido.
             * @param string[]          $row      Uma linha do banco de dados.
             * @param string|array|NULL $metamask Metamask (consulte convertToBeans).
             * @return OODBBean|NULL.
             */
            public static function convertToBean($type, $row, $metamask = NULL)
            {
                if (!count($row))
                {
                    return NULL;
                }

                $beans = self::$redbean->convertToBeans($type, array($row), $metamask);
                $bean  = reset($beans);

                return $bean;
            }

            /**
             * Função de conveniência para "encontrar" beans em
             * uma consulta SQL. Usado principalmente para obter
             * uma série de beans, bem como dados de paginação (para
             * paginar resultados) e opcionalmente também outros
             * dados (que não devem ser considerados parte de um
             * bean).
             *
             * Exemplo:
             *     $books = R::findFromSQL("book", "
             *         SELECT *, count(*) OVER() AS total
             *         FROM book
             *         WHERE {$filter}
             *         OFFSET {$from} LIMIT {$to} ", ["total"]);
             *
             * É o mesmo que fazer (o exemplo usa o dialeto PostgreSQL):
             *     $rows = R::getAll("
             *         SELECT *, count(*) OVER() AS total
             *         FROM book
             *         WHERE {$filter}
             *         OFFSET {$from} LIMIT {$to}
             *     ", $params);
             *
             *     $books = R::convertToBeans("book", $rows, ["total"]);
             *
             * Os dados adicionais podem ser obtidos usando:
             *     $book->info("total");
             *
             * Para mais detalhes veja R::convertToBeans(). Se você
             * definir $autoExtract como true e a meta-máscara for
             * um array, um array será retornado contendo dois
             * arrays aninhados, o primeiro desses arrays aninhados
             * conterá os meta valores que você solicitou, o segundo
             * array conterá os beans.
             *
             * @param string       $type        Tipo de bean a ser produzido.
             * @param string       $sql         Snippet de consulta SQL a ser usado.
             * @param array        $bindings    Ligações para consulta (opcional).
             * @param string|array $metamask    Meta máscara (opcional, o padrão é "extra_").
             * @param boolean      $autoExtract true para retornar valores de meta-máscara
             *                                  como primeiro item do vetor.
             * @return array.
             */
            public static function findFromSQL($type, $sql, $bindings = array(), $metamask = "extra_", $autoExtract = false)
            {
                $rows = self::query("get", $sql, $bindings);
                $beans = array();

                if (count($rows))
                {
                    $beans = self::$redbean
                        ->convertToBeans(
                            $type,
                            $rows,
                            $metamask
                        );
                }

                if ($autoExtract && is_array($metamask))
                {
                    $values = array();
                    $firstBean = NULL;

                    if (count($beans))
                    {
                        $firstBean = reset($beans);
                    }

                    foreach ($metamask as $key)
                    {
                        $values[$key] = ($firstBean) ? $firstBean->info($key) : NULL;
                    }

                    return array(
                        $values,
                        $beans
                    );
                }

                return $beans;
            }

            /**
             * Testa se um bean foi associado a uma ou mais tags
             * listadas. Se o terceiro parâmetro for true, este
             * método retornará true somente se todas as tags que
             * foram especificadas estiverem de fato associadas ao
             * bean fornecido, caso contrário, false. Se o terceiro
             * parâmetro for false, este método retornará true se
             * uma das tags corresponder, false se nenhuma
             * corresponder.
             *
             * A lista de tags pode ser um vetor com nomes de tags
             * ou uma lista separada por vírgulas de nomes de tags.
             *
             * Uso:
             *     <code>
             *         R::hasTag($blog, "horror,movie", true);
             *     </code>
             *
             * O exemplo acima retorna true se o bean $blog tiver
             * sido marcado como terror e filme. Se a postagem
             * tiver sido marcada apenas como "filme" ou "horror"
             * esta operação retornará false porque o terceiro
             * parâmetro foi definido como true.
             *
             * @param  OODBBean        $bean Bean para verificar tags.
             * @param  string|string[] $tags Lista de tags.
             * @param  boolean         $all  Se todos devem corresponder ou
             *                               apenas alguns.
             * @return boolean.
             */
            public static function hasTag($bean, $tags, $all = false)
            {
                return self::$tagManager
                    ->hasTag(
                        $bean,
                        $tags,
                        $all
                    );
            }

            /**
             * Remove todas as tags especificadas do bean. As tags
             * especificadas no segundo parâmetro não estarão mais
             * associadas ao bean.
             *
             * A lista de tags pode ser um vetor com nomes de tags
             * ou uma lista separada por vírgulas de nomes de tags.
             *
             * Uso:
             *     <code>
             *         R::untag($blog, "smart,interesting");
             *     </code>
             *
             * No exemplo acima, o bean $blog não estará mais
             * associado às tags "smart" e "interesting".
             *
             * @param  OODBBean        $bean    Bean marcado.
             * @param  string|string[] $tagList Lista de tags (nomes).
             * @return void.
             */
            public static function untag($bean, $tagList)
            {
                self::$tagManager->untag($bean, $tagList);
            }

            /**
             * Marca um bean ou retorna tags associadas a um
             * bean. Se $tagList for NULL ou omitido, este
             * método retornará uma lista separada por
             * vírgulas de tags associadas ao bean fornecido.
             * Se $tagList for uma lista separada por vírgulas (string)
             * de tags, todas as tags serão associadas ao bean.
             * Você também pode passar um array em vez de uma
             * string.
             *
             * Uso:
             *     <code>
             *         R::tag($meal, "TexMex,Mexican");
             *         $tags = R::tag($meal);
             *     </code>
             *
             * A primeira linha no exemplo acima marcará $meal
             * como "TexMex" e "Mexican Cuisine". A segunda linha
             * recuperará todas as tags anexadas ao objeto refeição.
             *
             * @param OODBBean      $bean    Bean para tag.
             * @param string[]|NULL $tagList Tags a serem anexadas ao bean
             *                               especificado.
             * @return string[].
             */
            public static function tag(OODBBean $bean, $tagList = NULL)
            {
                return self::$tagManager
                    ->tag(
                        $bean,
                        $tagList
                    );
            }

            /**
             * Adiciona tags a um bean. Se $tagList for uma lista
             * de tags separadas por vírgula, todas as tags serão
             * associadas ao bean. Você também pode passar um
             * array em vez de uma string.
             *
             * Uso:
             *     <code>
             *         R::addTags($blog, ["halloween"]);
             *     </code>
             *
             * O exemplo adiciona a tag "halloween" ao bean $blog.
             *
             * @param OODBBean        $bean    Bean para tag.
             * @param string|string[] $tagList Lista de tags para adicionar ao bean.
             * @return void.
             */
            public static function addTags(OODBBean $bean, $tagList)
            {
                self::$tagManager
                    ->addTags(
                        $bean,
                        $tagList
                    );
            }

            /**
             * Retorna todos os beans que foram marcados com uma
             * ou mais das tags especificadas. A lista de tags
             * pode ser um vetor com nomes de tags ou uma lista
             * separada por vírgulas de nomes de tags.
             *
             * Uso:
             *     <code>
             *         $watchList = R::tagged(
             *             "movie",
             *             "horror,gothic",
             *             " ORDER BY movie.title DESC LIMIT ?",
             *             [
             *                 10
             *             ]
             *         );
             *     </code>
             *
             * O exemplo usa R::tagged() para encontrar todos os
             * filmes que foram marcados como "horror" ou "gótico",
             * ordená-los por título e limitar o número de filmes
             * a serem retornados a 10.
             *
             * @param string          $beanType Tipo de bean que você procura.
             * @param string|string[] $tagList  Lista de tags para corresponder.
             * @param string          $sql      SQL adicional (use apenas para
             *                                  paginação).
             * @param array           $bindings Ligações.
             * @return OODBBean[].
             */
            public static function tagged($beanType, $tagList, $sql = "", $bindings = array())
            {
                return self::$tagManager
                    ->tagged(
                        $beanType,
                        $tagList,
                        $sql,
                        $bindings
                    );
            }

            /**
             * Retorna todos os beans que foram marcados com TODAS
             * as tags fornecidas. Este método funciona da mesma
             * forma que R::tagged() exceto que este método retorna
             * apenas beans que foram marcados com todos os rótulos
             * especificados.
             *
             * A lista de tags pode ser um vetor com nomes de tags
             * ou uma lista separada por vírgulas de nomes de tags.
             *
             * Uso:
             *     <code>
             *         $watchList = R::taggedAll(
             *             "movie",
             *             [
             *                 "gothic",
             *                 "short"
             *             ],
             *             " ORDER BY movie.id DESC LIMIT ? ",
             *             [
             *                 4
             *             ]
             *         );
             *     </code>
             *
             * O exemplo acima retorna no máximo 4 filmes (devido à
             * cláusula LIMIT no SQL Query Snippet) que foram marcados
             * como AMBOS "short" E "gothic".
             *
             * @param string          $beanType Tipo de bean que você procura.
             * @param string|string[] $tagList  Lista de tags para corresponder.
             * @param string          $sql      Trecho sql adicional.
             * @param array           $bindings Ligações.
             * @return OODBBean[].
             */
            public static function taggedAll($beanType, $tagList, $sql = "", $bindings = array())
            {
                return self::$tagManager
                    ->taggedAll(
                        $beanType,
                        $tagList,
                        $sql,
                        $bindings
                    );
            }

            /**
             * O mesmo que taggedAll() mas conta apenas beans (não
             * retorna beans).
             *
             * @see R::taggedAll.
             * @param string          $beanType Tipo de bean que você procura.
             * @param string|string[] $tagList  Lista de tags para corresponder.
             * @param string          $sql      Trecho sql adicional.
             * @param array           $bindings Ligações.
             * @return integer.
             */
            public static function countTaggedAll($beanType, $tagList, $sql = "", $bindings = array())
            {
                return self::$tagManager
                    ->countTaggedAll(
                        $beanType,
                        $tagList,
                        $sql,
                        $bindings
                    );
            }

            /**
             * O mesmo que tagged() mas conta apenas beans (não
             * retorna beans).
             *
             * @see R::tagged.
             * @param string          $beanType Tipo de bean que você procura.
             * @param string|string[] $tagList  Lista de tags para corresponder.
             * @param string          $sql      Trecho sql adicional.
             * @param array           $bindings Ligações.
             * @return integer.
             */
            public static function countTagged($beanType, $tagList, $sql = "", $bindings = array())
            {
                return self::$tagManager
                    ->countTagged(
                        $beanType,
                        $tagList,
                        $sql,
                        $bindings
                    );
            }

            /**
             * Limpa todos os beans do tipo $beanType.
             *
             * @param string $beanType Tipo de bean que você deseja destruir
             *                         totalmente.
             * @return boolean.
             */
            public static function wipe($beanType)
            {
                return Facade::$redbean
                    ->wipe(
                        $beanType
                    );
            }

            /**
             * Conta o número de beans do tipo $type. Este
             * método aceita um segundo argumento para modificar
             * a consulta de contador. Um terceiro argumento
             * pode ser usado para fornecer ligações para o
             * snippet SQL.
             *
             * @param string $type     Tipo de beans que procuramos.
             * @param string $addSQL   Trecho SQL adicional.
             * @param array  $bindings Parâmetros para vincular ao SQL.
             * @return integer.
             */
            public static function count($type, $addSQL = "", $bindings = array())
            {
                return Facade::$redbean
                    ->count(
                        $type,
                        $addSQL,
                        $bindings
                    );
            }

            /**
             * Configura a fachada, quer ter um novo Writer ? Um
             * novo banco de dados de objetos ou um novo adaptador
             * e você quer isso imediatamente ? Use este método
             * para trocar sua fachada a quente por uma nova
             * caixa de ferramentas.
             *
             * @param ToolBox $tb Caixa de ferramentas para configurar a
             *                    fachada.
             * @return ToolBox
             */
            public static function configureFacadeWithToolbox(ToolBox $tb)
            {
                $oldTools = self::$toolbox;

                self::$toolbox = $tb;
                self::$writer = self::$toolbox->getWriter();
                self::$adapter = self::$toolbox->getDatabaseAdapter();
                self::$redbean = self::$toolbox->getRedBean();
                self::$finder = new Finder(self::$toolbox);
                self::$associationManager = new AssociationManager(self::$toolbox);
                self::$tree = new Tree(self::$toolbox);
                self::$redbean->setAssociationManager(self::$associationManager);
                self::$labelMaker = new LabelMaker(self::$toolbox);

                $helper = new SimpleModelHelper();
                $helper->attachEventListeners(self::$redbean);

                if (self::$redbean->getBeanHelper() === NULL)
                {
                    self::$redbean->setBeanHelper(new SimpleFacadeBeanHelper);
                }

                self::$duplicationManager = new DuplicationManager(self::$toolbox);
                self::$tagManager = new TagManager(self::$toolbox);

                return $oldTools;
            }

            /**
             * Método de conveniência de fachada para sistema
             * de transação de adaptador. Inicia uma transação.
             *
             * Uso:
             *     <code>
             *         R::begin();
             *
             *         try
             *         {
             *             $bean1 = R::dispense("bean");
             *             R::store($bean1);
             *
             *             $bean2 = R::dispense("bean");
             *             R::store($bean2);
             *             R::commit();
             *         } catch(\Exception $e)
             *         {
             *             R::rollback();
             *         }
             *     </code>
             *
             * O exemplo acima ilustra como as transações no
             * RedBeanPHP são usadas. Neste exemplo, 2 beans
             * são armazenados ou nada é armazenado. Não é
             * possível que este trecho de código armazene
             * apenas metade dos beans. Se ocorrer uma
             * exceção, a transação será revertida e o banco
             * de dados permanecerá ‘intocado’.
             *
             * No modo fluido, as transações serão ignoradas e
             * todas as consultas serão executadas como estão,
             * porque as alterações no esquema do banco de dados
             * acionarão automaticamente o sistema de transações
             * para confirmar tudo em alguns sistemas de banco
             * de dados. Se você usar um banco de dados que possa
             * lidar com alterações DDL, talvez você queira usar
             * setAllowFluidTransactions(true). Se você fizer isso,
             * o comportamento desta função em modo fluido dependerá
             * da plataforma de banco de dados utilizada.
             *
             * @return bool.
             */
            public static function begin()
            {
                if (!self::$allowFluidTransactions && !self::$redbean->isFrozen())
                {
                    return false;
                }

                /**
                 *
                 */
                self::$adapter->startTransaction();

                /**
                 *
                 */
                return true;
            }

            /**
             * Método de conveniência de facade para sistema de
             * transação de adaptador. Confirma uma transação.
             *
             * Uso:
             *     <code>
             *         R::begin();
             *
             *         try
             *         {
             *             $bean1 = R::dispense("bean");
             *             R::store($bean1);
             *
             *             $bean2 = R::dispense("bean");
             *             R::store($bean2);
             *             R::commit();
             *         } catch(\Exception $e)
             *         {
             *             R::rollback();
             *         }
             *     </code>
             *
             * O exemplo acima ilustra como as transações no RedBeanPHP
             * são usadas. Neste exemplo, 2 beans são armazenados ou
             * nada é armazenado. Não é possível que este trecho de
             * código armazene apenas metade dos beans. Se ocorrer uma
             * exceção, a transação será revertida e o banco de dados
             * permanecerá ‘intocado’.
             *
             * No modo fluido, as transações serão ignoradas e todas
             * as consultas serão executadas como estão, porque as
             * alterações no esquema do banco de dados acionarão
             * automaticamente o sistema de transações para confirmar
             * tudo em alguns sistemas de banco de dados. Se você usar
             * um banco de dados que possa lidar com alterações DDL,
             * talvez você queira usar setAllowFluidTransactions(true).
             * Se você fizer isso, o comportamento desta função em modo
             * fluido dependerá da plataforma de banco de dados utilizada.
             *
             * @return bool.
             */
            public static function commit()
            {
                if (!self::$allowFluidTransactions && !self::$redbean->isFrozen())
                {
                    return false;
                }

                self::$adapter->commit();
                return true;
            }

            /**
             * Método de conveniência de facade para sistema de
             * transação de adaptador. Reverte uma transação.
             *
             * Uso:
             *     <code>
             *         R::begin();
             *
             *         try
             *         {
             *             $bean1 = R::dispense("bean");
             *             R::store($bean1);
             *
             *             $bean2 = R::dispense("bean");
             *             R::store($bean2);
             *             R::commit();
             *         } catch(\Exception $e)
             *         {
             *             R::rollback();
             *         }
             *     </code>
             *
             * O exemplo acima ilustra como as transações no RedBeanPHP
             * são usadas. Neste exemplo, 2 beans são armazenados ou nada
             * é armazenado. Não é possível que este trecho de código
             * armazene apenas metade dos beans. Se ocorrer uma exceção,
             * a transação será revertida e o banco de dados
             * permanecerá ‘intocado’.
             *
             * No modo fluido, as transações serão ignoradas e todas
             * as consultas serão executadas como estão, porque as
             * alterações no esquema do banco de dados acionarão
             * automaticamente o sistema de transações para confirmar
             * tudo em alguns sistemas de banco de dados. Se você usar
             * um banco de dados que possa lidar com alterações DDL,
             * talvez você queira usar setAllowFluidTransactions(true).
             * Se você fizer isso, o comportamento desta função em modo
             * fluido dependerá da plataforma de banco de dados utilizada.
             *
             * @return bool.
             */
            public static function rollback()
            {
                if (!self::$allowFluidTransactions && !self::$redbean->isFrozen())
                {
                    return false;
                }

                /**
                 *
                 */
                self::$adapter->rollback();

                /**
                 *
                 */
                return true;
            }

            /**
             * Retorna uma lista de colunas. Formato deste
             * array: array(fieldname => type). Observe que
             * este método só funciona no modo fluido porque
             * pode ser bastante pesado em servidores de
             * produção !
             *
             * @param  string $table Nome da tabela (não tipo)
             *                       da qual você deseja obter
             *                       colunas.
             * @return string[].
             */
            public static function getColumns($table)
            {
                return self::$writer->getColumns($table);
            }

            /**
             * Gera espaços de ponto de interrogação para um
             * vetor de valores. Dado um array e uma string
             * de modelo opcional, este método produzirá uma
             * string contendo slots de parâmetros para uso
             * em uma string de consulta SQL.
             *
             * Uso:
             *     <code>
             *         R::genSlots(
             *             array(
             *                 "a",
             *                 "b"
             *             )
             *         );
             *     </code>
             *
             * A instrução no exemplo produzirá a string:
             * "?,?".
             *
             * Outro exemplo, usando uma string de modelo:
             *     <code>
             *         R::genSlots(
             *             array(
             *                 "a",
             *                 "b"
             *             ),
             *
             *             " IN( %s ) "
             *         );
             *     </code>
             *
             * A instrução no exemplo produzirá a string:
             * " IN( ?,? ) ".
             *
             * @param array       $array    Array para gerar espaços de ponto
             *                              de interrogação.
             * @param string|NULL $template Modelo para usar.
             * @return string.
             */
            public static function genSlots($array, $template = NULL)
            {
                return ArrayTool::genSlots(
                    $array,
                    $template
                );
            }

            /**
             * Método conveniente para anexar rapidamente beans
             * pais. Embora normalmente isso também possa ser
             * feito com findMulti(), essa abordagem às vezes
             * pode ser um pouco detalhada. Este método
             * conveniente usa um snippet SQL padrão, mas
             * substituível, para executar a operação,
             * aproveitando o poder de findMulti().
             *
             * Uso:
             *     <code>
             *         $users = R::find("user");
             *         $users = R::loadJoined($users, "country");
             *     </code>
             *
             * Esta é uma alternativa para:
             *     <code>
             *         $all = R::findMulti(
             *             "country",
             *             R::genSlots(
             *                 $users,
             *                 "SELECT country.* FROM country WHERE id IN ( %s )"
             *             ),
             *             array_column(
             *                 $users,
             *                 "country_id"
             *             ),
             *             [
             *                 Finder::onmap(
             *                     "country",
             *                     $gebruikers
             *                 )
             *             ]
             *         );
             *     </code>
             *
             * @param OODBBean[]|TypedModel[] $beans       Uma lista de OODBBeans.
             * @param string                  $type        Um tipo de string.
             * @param string                  $sqlTemplate Uma string de modelo SQL para a
             *                                             consulta SELECT.
             * @return OODBBean[]|TypedModel[].
             */
            public static function loadJoined($beans, $type, $sqlTemplate = 'SELECT %s.* FROM %s WHERE id IN (%s)')
            {
                if (!count($beans))
                {
                    return array();
                }

                $ids = array();
                $key = "{$type}_id";
                foreach ($beans as $bean)
                {
                    $ids[] = $bean->{$key};
                }

                $result = self::findMulti(
                    $type,
                    self::genSlots(
                        $beans,
                        sprintf(
                            $sqlTemplate,
                            $type,
                            $type,
                            '%s'
                        )
                    ),

                    $ids,
                    array(
                        Finder::onmap(
                            $type,
                            $beans
                        )
                    )
                );

                /**
                 *
                 */
                $bean = reset($beans);

                /**
                 *
                 */
                return $result[
                    $bean->getMeta(
                        "type"
                    )
                ];
            }

            /**
             * Achata um array de ligações multidimensionais para
             * uso com genSlots().
             *
             * Uso:
             *     <code>
             *         R::flat(
             *             array(
             *                 "a",
             *                 array(
             *                     "b"
             *                 ),
             *                 "c"
             *             )
             *         );
             *     </code>
             *
             * Produz um vetor como: ["a", "b", "c"].
             *
             * @param array $array  Array para achatar.
             * @param array $result Parâmetro de vetor de resultado (para recursão).
             * @return array.
             */
            public static function flat($array, $result = array())
            {
                return ArrayTool::flat(
                    $array,
                    $result
                );
            }

            /**
             * Nukes todo o banco de dados. Isto removerá todas as
             * estruturas de esquema do banco de dados. Funciona
             * apenas no modo fluido. Tenha cuidado com este método.
             *
             * @warning Método perigoso, removerá todas as tabelas,
             *          colunas, etc.
             *
             * @return void.
             */
            public static function nuke()
            {
                return self::wipeAll(true);
            }

            /**
             * Trunca ou descarta todas as tabelas/visualizações do
             * banco de dados. Esvazia o banco de dados. Se o sinalizador
             * deleteTables estiver definido como true, esta função
             * também removerá as estruturas do banco de dados. Este
             * último funciona apenas no modo fluido.
             *
             * @param boolean $alsoDeleteTables true para limpar todo o
             *                                  banco de dados.
             * @return void.
             */
            public static function wipeAll($alsoDeleteTables = false)
            {
                if ($alsoDeleteTables)
                {
                    if (!self::$redbean->isFrozen())
                    {
                        self::$writer->wipeAll();
                    }
                } else
                {
                    foreach (self::$writer->getTables() as $table)
                    {
                        self::wipe($table);
                    }
                }
            }

            /**
             * Função abreviada para armazenar um conjunto de beans
             * de uma vez, os IDs serão retornados como um array.
             * Para informações consulte a função R::store(). Um
             * protetor de loop.
             *
             * Se o segundo parâmetro for definido como true e o
             * modo híbrido for permitido (padrão OFF para novato),
             * então o RedBeanPHP mudará automaticamente e
             * temporariamente para o modo fluido para tentar
             * armazenar o bean no caso de uma SQLException.
             *
             * @param OODBBean[] $beans            Lista de beans a serem armazenados.
             * @param boolean    $unfreezeIfNeeded Novas tentativas no modo fluido no
             *                                     modo híbrido.
             * @return int[] ids.
             */
            public static function storeAll($beans, $unfreezeIfNeeded = false)
            {
                $ids = array();
                foreach ($beans as $bean)
                {
                    $ids[] = self::store(
                        $bean,
                        $unfreezeIfNeeded
                    );
                }

                return $ids;
            }

            /**
             * Função abreviada para descartar um conjunto de grãos de
             * uma vez. Para obter informações consulte a função R::trash().
             * Um protetor de loop.
             *
             * @param OODBBean[] $beans Lista de beans a serem descartados.
             * @return int.
             */
            public static function trashAll($beans)
            {
                $numberOfDeletion = 0;
                foreach ($beans as $bean)
                {
                    $numberOfDeletion += self::trash($bean);
                }

                return $numberOfDeletion;
            }

            /**
             * Função abreviada para descartar uma série de beans usando
             * apenas IDs. Esta função combina trashAll e carregamento
             * em lote em uma chamada. Observe que embora esta função
             * aceite apenas IDs de beans, os beans ainda serão carregados
             * primeiro. Isso ocorre porque a função ainda respeita todos
             * os plugs FUSE que podem ter sido associados à lógica de
             * domínio associada a esses beans. Se você realmente deseja
             * excluir apenas registros do banco de dados, use uma consulta
             * SQL DELETE-FROM simples.
             *
             * @param string $type O tipo de bean que você deseja descartar.
             * @param int[]  $ids  Lista de beans IDs.
             * @return void.
             */
            public static function trashBatch($type, $ids)
            {
                self::trashAll(
                    self::batch(
                        $type,
                        $ids
                    )
                );
            }

            /**
             * Função abreviada para localizar e descartar grãos.
             * Esta função combina trashAll e find. Dado um tipo
             * de bean, um snippet de consulta e opcionalmente
             * algumas ligações de parâmetros, esta função irá
             * procurar os beans descritos na consulta e seus
             * parâmetros e então alimentá-los para a função
             * trashAll para serem descartados.
             *
             * Observe que embora esta função aceite apenas um tipo
             * de bean e um trecho de consulta, os beans ainda serão
             * carregados primeiro. Isso ocorre porque a função ainda
             * respeita todos os plugs FUSE que podem ter sido
             * associados à lógica de domínio associada a esses beans.
             * Se você realmente deseja excluir apenas registros do
             * banco de dados, use uma consulta SQL DELETE-FROM
             * simples.
             *
             * Retorna o número de beans excluídos.
             *
             * @param string      $type       Tipo de bean a ser procurado no
             *                                banco de dados.
             * @param string|NULL $sqlSnippet Um trecho de consulta SQL.
             * @param array       $bindings   Ligações de parâmetros SQL.
             * @return int.
             */
            public static function hunt($type, $sqlSnippet = NULL, $bindings = array())
            {
                $numberOfTrashedBeans = 0;
                $beans = self::findCollection(
                    $type,
                    $sqlSnippet,
                    $bindings
                );

                while($bean = $beans->next())
                {
                    self::trash($bean);
                    $numberOfTrashedBeans++;
                }

                return $numberOfTrashedBeans;
            }

            /**
             * Alterna o cache do gravador. Ativa ou desativa o cache
             * do gravador. O Writer Cache é um sistema de cache simples
             * baseado em consulta que pode melhorar o desempenho sem a
             * necessidade de gerenciamento de cache. Este sistema de
             * cache armazenará em cache consultas sem modificação
             * marcadas com comentários SQL especiais. Assim que uma
             * consulta não marcada for executada, o cache será liberado.
             * Apenas consultas de seleção não modificadoras foram marcadas,
             * portanto, este mecanismo é uma forma bastante segura de
             * armazenamento em cache, não exigindo liberações ou recargas
             * explícitas. É claro que isso não se aplica se você pretende
             * testar ou simular consultas simultâneas.
             *
             * @param boolean $yesNo true para ativar o cache, false para
             *                       desativar o cache.
             * @return void.
             */
            public static function useWriterCache($yesNo)
            {
                self::getWriter()
                    ->setUseCache(
                        $yesNo
                    );
            }

            /**
             * Um rótulo é um bean com apenas uma propriedade id,
             * type e name. Esta função distribuirá beans para
             * todas as entradas do array. Os valores do array
             * serão atribuídos à propriedade name de cada bean
             * individual.
             *
             * @param string   $type   Tipo de bean que você gostaria de comer.
             * @param string[] $labels Lista de rótulos, nomes para cada bean.
             * @return OODBBean[].
             */
            public static function dispenseLabels($type, $labels)
            {
                return self::$labelMaker
                    ->dispenseLabels(
                        $type,
                        $labels
                    );
            }

            /**
             * Gera e retorna um valor ENUM. É assim que o RedBeanPHP
             * lida com ENUMs. Retorna um bean (recém-criado) representando
             * o valor ENUM desejado ou retorna uma lista de todos os
             * enums para o tipo.
             *
             * Para obter (e adicionar se necessário) um valor ENUM:
             *     <code>
             *         $tea->flavour = R::enum("flavour:apple");
             *     </code>
             *
             * Retorna um bean do tipo "flavour" com name = apple.
             * Isso adicionará um bean com nome de propriedade (definido
             * como APPLE) ao banco de dados, caso ainda não exista.
             *
             * Para obter todos os sabores:
             *     <code>
             *         R::enum("flavour");
             *     </code>
             *
             * Para obter uma lista de todos os nomes de sabores:
             *     <code>
             *         R::gatherLabels(
             *             R::enum("flavour")
             *         );
             *     </code>
             *
             * @param string $enum Tipo ou valor de tipo.
             * @return OODBBean|OODBBean[].
             */
            public static function enum($enum)
            {
                return self::$labelMaker
                    ->enum(
                        $enum
                    );
            }

            /**
             * Reúne rótulos de bean. Esta função percorre os beans,
             * coleta os valores das propriedades de nome de cada
             * bean individual e armazena os nomes em um novo array.
             * O array então é classificado usando a função de
             * classificação padrão do PHP (sort).
             *
             * @param OODBBean[] $beans Lista de beans para fazer loop.
             * @return string[].
             */
            public static function gatherLabels($beans)
            {
                return self::$labelMaker
                    ->gatherLabels(
                        $beans
                    );
            }

            /**
             * Fecha a conexão com o banco de dados. Embora as conexões
             * com o banco de dados sejam fechadas automaticamente no
             * final do script PHP, geralmente é recomendado fechar as
             * conexões com o banco de dados para melhorar o desempenho.
             * Fechar uma conexão com o banco de dados retornará
             * imediatamente os recursos para o PHP.
             *
             * Uso:
             *     <code>
             *         R::setup(...);
             *             ... do stuff ...
             *         R::close();
             *     </code>
             *
             * @return void.
             */
            public static function close()
            {
                if (isset(self::$adapter))
                {
                    self::$adapter->close();
                }
            }

            /**
             * Função de conveniência simples, retorna representação
             * formatada em data ISO de $time.
             *
             * @param int|NULL $time UNIX timestamp.
             * @return string.
             */
            public static function isoDate($time = NULL)
            {
                if (!$time)
                {
                    $time = time();
                }

                return @date("Y-m-d", $time);
            }

            /**
             * Função de conveniência simples, retorna representação
             * formatada de data e hora ISO de $time.
             *
             * @param int|NULL $time UNIX timestamp.
             * @return string.
             */
            public static function isoDateTime($time = NULL)
            {
                if (!$time)
                {
                    $time = time();
                }

                return @date("Y-m-d H:i:s", $time);
            }

            /**
             * Define o adaptador de banco de dados que você deseja
             * usar. O adaptador de banco de dados gerencia a conexão
             * com o banco de dados e abstrai interfaces específicas
             * do driver de banco de dados.
             *
             * @param Adapter $adapter Adaptador de banco de dados
             *                         para uso em facade.
             * @return void.
             */
            public static function setDatabaseAdapter(Adapter $adapter)
            {
                self::$adapter = $adapter;
            }

            /**
             * Define o Gravador de Consultas que você deseja usar.
             * O Query Writer grava e executa consultas de banco de
             * dados usando o adaptador de banco de dados. Ele
             * transforma "comandos" do RedBeanPHP em "instruções"
             * de banco de dados.
             *
             * @param QueryWriter $writer Instância do Query Writer para
             *                            uso da fachada.
             * @return void.
             */
            public static function setWriter(QueryWriter $writer)
            {
                self::$writer = $writer;
            }

            /**
             * Define o OODB que você deseja usar. O banco de dados
             * orientado a objetos RedBeanPHP é a interface principal
             * do RedBeanPHP que permite armazenar e recuperar objetos
             * RedBeanPHP (ou seja, beans).
             *
             * @param OODB $redbean Banco de dados de objetos para uso
             *                      de fachada.
             */
            public static function setRedBean(OODB $redbean)
            {
                self::$redbean = $redbean;
            }

            /**
             * Acessador opcional para código limpo. Define o
             * adaptador de banco de dados que você deseja usar.
             *
             * @return Adapter.
             */
            public static function getDatabaseAdapter()
            {
                return self::$adapter;
            }

            /**
             * Caso você use PDO (que é recomendado e padrão, mas
             * não obrigatório, daí o adaptador de banco de dados),
             * você pode usar este método para obter o objeto PDO
             * diretamente. Este é um método de conveniência, fará
             * o mesmo que:
             *
             * <code>
             *     R::getDatabaseAdapter()
             *         ->getDatabase()
             *         ->getPDO();
             * </code>
             *
             * Se o objeto PDO não puder ser encontrado, por
             * qualquer motivo, este método retornará NULL.
             *
             * @return NULL|\PDO.
             */
            public static function getPDO()
            {
                $databaseAdapter = self::getDatabaseAdapter();

                if (is_null($databaseAdapter))
                {
                    return NULL;
                }

                $database = $databaseAdapter->getDatabase();
                if (is_null($database))
                {
                    return NULL;
                }

                if (!method_exists($database, "getPDO"))
                {
                    return NULL;
                }

                /**
                 * @var RPDO $database.
                 */
                return $database->getPDO();
            }

            /**
             * Retorna a instância atual do gerenciador de duplicação.
             *
             * @return DuplicationManager.
             */
            public static function getDuplicationManager()
            {
                return self::$duplicationManager;
            }

            /**
             * Acessador opcional para código limpo. Define o
             * adaptador de banco de dados que você deseja usar.
             *
             * @return QueryWriter.
             */
            public static function getWriter()
            {
                return self::$writer;
            }

            /**
             * Acessador opcional para código limpo. Define o
             * adaptador de banco de dados que você deseja usar.
             *
             * @return OODB.
             */
            public static function getRedBean()
            {
                return self::$redbean;
            }

            /**
             * Retorna a caixa de ferramentas atualmente usada pela
             * fachada. Para definir a caixa de ferramentas use
             * R::setup() ou R::configureFacadeWithToolbox(). Para
             * criar uma caixa de ferramentas use Setup::kickstart().
             * Ou crie uma caixa de ferramentas manual usando a
             * classe ToolBox.
             *
             * @return ToolBox.
             */
            public static function getToolBox()
            {
                return self::$toolbox;
            }

            /**
             * Principalmente para uso interno, mas pode ser útil
             * para alguns usuários. Isso retorna todos os componentes
             * da caixa de ferramentas atualmente selecionada.
             *
             * Retorna os componentes na seguinte ordem:
             *
             * # OODB instance (getRedBean())
             * # Database Adapter
             * # Query Writer
             * # Toolbox itself
             *
             * @return array.
             */
            public static function getExtractedToolbox()
            {
                return array(
                    self::$redbean,
                    self::$adapter,
                    self::$writer,
                    self::$toolbox
                );
            }

            /**
             * Metodo facade para AQueryWriter::renameAssociation().
             *
             * @param string|string[] $from.
             * @param string          $to.
             * @return void.
             */
            public static function renameAssociation($from, $to = NULL)
            {
                AQueryWriter::renameAssociation(
                    $from,
                    $to
                );
            }

            /**
             * Pequeno método auxiliar para servidor Resty Bean Can
             * e outros. Pega uma variedade de grãos e exporta cada
             * bean. Ao contrário de exportAll, este método não
             * recorre a listas próprias e listas compartilhadas, os
             * beans são exportados como estão, apenas listas
             * carregadas são exportadas.
             *
             * @param OODBBean[] $beans beans.
             * @return array[].
             */
            public static function beansToArray($beans)
            {
                $list = array();

                foreach ($beans as $bean)
                {
                    $list[] = $bean->export();
                }

                return $list;
            }

            /**
             * Define o modo de erro para FUSE. O que fazer se
             * não existir um método de modelo FUSE ? Você pode
             * definir as seguintes opções:
             *     * OODBBean::C_ERR_IGNORE (default), ignores a chamada, devolve NULL.
             *     * OODBBean::C_ERR_LOG,              registra o incidente usando error_log.
             *     * OODBBean::C_ERR_NOTICE,           desencadeia um E_USER_NOTICE.
             *     * OODBBean::C_ERR_WARN,             desencadeia um E_USER_WARNING.
             *     * OODBBean::C_ERR_EXCEPTION,        lança uma exceção.
             *     * OODBBean::C_ERR_FUNC,             permite que você especifique um
             *                                         manipulador personalizado (função).
             *     * OODBBean::C_ERR_FATAL,            desencadeia um E_USER_ERROR.
             *
             * <code>
             *     Assinatura do método do manipulador personalizado:
             *     handler(
             *         array(
             *             "message" => string
             *             "bean" => OODBBean
             *             "method" => string
             *         )
             *     )
             * </code>
             *
             * Este método retorna o modo antigo e o manipulador
             * como um array.
             *
             * @param integer       $mode modo, determina como lidar com erros.
             * @param callable|NULL $func manipulador personalizado (se aplicável).
             * @return array.
             */
            public static function setErrorHandlingFUSE($mode, $func = NULL)
            {
                return OODBBean::setErrorHandlingFUSE(
                    $mode,
                    $func
                );
            }

            /**
             * Despeja os dados do bean no array. Dado um ou
             * mais beans, este método retornará um array
             * contendo a primeira parte da representação em
             * string de cada item do array.
             *
             * Uso:
             *     <code>
             *         echo R::dump($bean);
             *     </code>
             *
             * O exemplo mostra como fazer echo com resultado de
             * um despejo simples. Isso imprimirá a representação
             * de string do bean especificado na tela, limitando
             * a saída por bean a 35 caracteres para melhorar a
             * legibilidade. Os beans aninhados também serão
             * descartados.
             *
             * @param OODBBean|OODBBean[] $data Um bean ou uma variedade de beans.
             * @return string|string[].
             */
            public static function dump($data)
            {
                return Dump::dump($data);
            }

            /**
             * Vincula uma função SQL a uma coluna. Este método pode
             * ser usado para configurar um esquema de decodificação/codificação
             * ou realizar a inserção de UUID. Este método é especialmente
             * útil para lidar com colunas espaciais MySQL, porque elas
             * precisam ser processadas primeiro usando as funções
             * asText/GeomFromText.
             *
             * Exemplo:
             *     <code>
             *         R::bindFunc("read", "location.point", "asText");
             *         R::bindFunc("write", "location.point", "GeomFromText");
             *     </code>
             *
             * Passar NULL como função redefinirá (limpará) a
             * função para esta coluna/modo.
             *
             * @param string  $mode       Modo para função: ou seja, ler ou escrever.
             * @param string  $field      Campo (table.column) ao qual vincular a função.
             * @param string  $function   Função SQL para vincular à coluna especificada.
             * @param boolean $isTemplate true se $function for uma string SQL, false
             *                            apenas para o nome de uma função.
             * @return void.
             */
            public static function bindFunc($mode, $field, $function, $isTemplate = false)
            {
                self::$redbean
                    ->bindFunc(
                        $mode,
                        $field,
                        $function,
                        $isTemplate
                    );
            }

            /**
             * Define aliases globais. Registra um lote de aliases
             * de uma só vez. Isso funciona da mesma forma que fetchAs,
             * mas explicitamente. Por exemplo, se você registrar o
             * alias "cover" para "page", uma propriedade contendo
             * uma referência a um page bean chamado "cover"
             * retornará corretamente o page bean e não um cover
             * bean (inexistente).
             *
             * <code>
             *     R::aliases(
             *         array(
             *             "cover" => "page"
             *         )
             *     );
             *
             *     $book = R::dispense("book");
             *     $page = R::dispense("page");
             *     $book->cover = $page;
             *
             *     R::store($book);
             *     $book = $book->fresh();
             *     $cover = $book->cover;
             *
             *     //
             *     // Página.
             *     //
             *     echo $cover->getMeta("type");
             * </code>
             *
             * O formato do vetor de registro de aliases é:
             * {alias} => {actual type}.
             *
             * No exemplo acima usamos:
             * cover => page.
             *
             * Desse ponto em diante, cada referência de bean a
             * uma capa retornará um bean de "página".
             *
             * @param string[] $list Lista de aliases globais a serem usados.
             * @return void.
             */
            public static function aliases($list)
            {
                OODBBean::aliases($list);
            }

            /**
             * Tries to find a bean matching a certain type and
             * criteria set. If no beans are found a new bean
             * will be created, the criteria will be imported into this
             * bean and the bean will be stored and returned.
             * If multiple beans match the criteria only the first one
             * will be returned.
             *
             * @param string $type type of bean to search for
             * @param array  $like criteria set describing the bean to search for
             * @param boolean &$hasBeenCreated set to true if bean has been created
             *
             * @return OODBBean
             */
            public static function findOrCreate($type, $like = array(), $sql = "", &$hasBeenCreated = false)
            {
                return self::$finder
                    ->findOrCreate(
                        $type,
                        $like,
                        $sql,
                        $hasBeenCreated
                    );
            }

            /**
             * Tenta encontrar beans que correspondam ao tipo
             * especificado e ao conjunto de critérios.
             *
             * Se o snippet SQL adicional opcional for uma condição,
             * ele será colado ao restante da consulta usando o
             * operador AND.
             *
             * @param string $type     Tipo de bean a ser pesquisado.
             * @param array  $like     Conjunto de critérios opcionais que
             *                         descreve o bean a ser pesquisado.
             * @param string $sql      SQL adicional opcional para classificação.
             * @param array  $bindings Ligações.
             * @return OODBBean[].
             */
            public static function findLike($type, $like = array(), $sql = "", $bindings = array())
            {
                return self::$finder
                    ->findLike(
                        $type,
                        $like,
                        $sql,
                        $bindings
                    );
            }

            /**
             * Inicia o registro de consultas. Use este método para
             * iniciar o registro de consultas SQL que estão sendo
             * executadas pelo adaptador. As consultas de registro
             * não as imprimirão na tela. Use R::getLogs() para
             * recuperar os logs.
             *
             * Uso:
             *     <code>
             *         R::startLogging();
             *         R::store(
             *             R::dispense("book")
             *         );
             *
             *         R::find("book", "id > ?",[0]);
             *         $logs = R::getLogs();
             *         $count = count($logs);
             *         print_r($logs);
             *
             *         R::stopLogging();
             *     </code>
             *
             * No exemplo acima iniciamos uma sessão de log
             * durante a qual armazenamos um bean vazio do tipo
             * book. Para inspecionar os logs, invocamos
             * R::getLogs() após interromper o registro.
             *
             * @observação você não pode usar R::debug e
             * R::startLogging ao mesmo tempo porque R::debug
             * é essencialmente um tipo especial de registro.
             *
             * @return void.
             */
            public static function startLogging()
            {
                self::debug(true, RDefault::C_LOGGER_ARRAY);
            }

            /**
             * Interrompe o registro em log e libera os logs, um
             * método conveniente para interromper o registro em
             * log de consultas. Use este método para interromper
             * o registro de consultas SQL que estão sendo executadas
             * pelo adaptador. As consultas de registro não as
             * imprimirão na tela. Use R::getLogs() para recuperar
             * os logs.
             *
             * <code>
             *     R::startLogging();
             *     R::store(
             *         R::dispense(
             *             "book"
             *         )
             *     );
             *
             *     R::find("book", "id > ?",[0]);
             *     $logs = R::getLogs();
             *     $count = count($logs);
             *
             *     print_r($logs);
             *     R::stopLogging();
             * </code>
             *
             * No exemplo acima iniciamos uma sessão de log durante
             * a qual armazenamos um bean vazio do tipo book. Para
             * inspecionar os logs, invocamos R::getLogs() após
             * interromper o registro.
             *
             * @observação, você não pode usar R::debug e R::startLogging
             * ao mesmo tempo porque R::debug é essencialmente um tipo
             * especial de registro.
             *
             * @observação, ao interromper o registro, você também
             * libera os logs. Portanto, pare de registrar apenas
             * DEPOIS para obter os logs de consulta usando
             * R::getLogs().
             *
             * @return void.
             */
            public static function stopLogging()
            {
                self::debug(false);
            }

            /**
             * Retorna as entradas de log escritas após startLogging.
             *
             * Use este método para obter os logs de consulta coletados
             * pelos mecanismos de criação de log. As consultas de
             * registro não as imprimirão na tela. Use R::getLogs()
             * para recuperar os logs.
             *
             * <code>
             *     R::startLogging();
             *     R::store(
             *         R::dispense(
             *             "book"
             *         )
             *     );
             *
             *     R::find("book", "id > ?",[0]);
             *     $logs = R::getLogs();
             *     $count = count($logs);
             *
             *     print_r($logs);
             *     R::stopLogging();
             * </code>
             *
             * No exemplo acima iniciamos uma sessão de log durante a
             * qual armazenamos um bean vazio do tipo book. Para
             * inspecionar os logs, invocamos R::getLogs() após
             * interromper o registro.
             *
             * Os logs podem ser parecidos com:
             *     [1] => SELECT `book`.*  FROM `book`  WHERE id > ?  -- keep-cache
             *     [2] => array ( 0 => 0, )
             *     [3] => resultset: 1 rows
             *
             * Basicamente, o elemento do vetor é uma entrada de
             * log. As ligações de parâmetros são representadas
             * como vetores aninhadas (consulte 2).
             *
             * @observação você não pode usar R::debug e R::startLogging
             * ao mesmo tempo porque R::debug é essencialmente um tipo
             * especial de registro.
             *
             * @observação ao interromper o registro, você também libera
             * os logs. Portanto, pare de registrar apenas DEPOIS de obter
             * os logs de consulta usando R::getLogs().
             *
             * @return string[].
             */
            public static function getLogs()
            {
                return self::getLogger()
                    ->getLogs();
            }

            /**
             * Redefine o contador de consultas. O contador de
             * consultas pode ser usado para monitorar o número
             * de consultas ao banco de dados que foram processadas
             * de acordo com o driver do banco de dados. Você pode
             * usar isso para monitorar o número de consultas
             * necessárias para renderizar uma página.
             *
             * Uso:
             *     <code>
             *         R::resetQueryCount();
             *         echo R::getQueryCount() . " queries processed.";
             *     </code>
             *
             * @return void.
             */
            public static function resetQueryCount()
            {
                self::$adapter->getDatabase()
                    ->resetCounter();
            }

            /**
             * Retorna o número de consultas SQL processadas. Este
             * método retorna o número de consultas ao banco de dados
             * que foram processadas de acordo com o driver do banco
             * de dados. Você pode usar isso para monitorar o número
             * de consultas necessárias para renderizar uma página.
             *
             * Uso:
             *     <code>
             *         echo R::getQueryCount() . " queries processed.";
             *     </code>
             *
             * @return integer.
             */
            public static function getQueryCount()
            {
                return self::$adapter
                    ->getDatabase()
                    ->getQueryCount();
            }

            /**
             * Retorna a instância do criador de logs atual que
             * está sendo usada pelo objeto de banco de dados.
             *
             * @return Logger|NULL.
             */
            public static function getLogger()
            {
                return self::$adapter
                    ->getDatabase()
                    ->getLogger();
            }

            /**
             * @deprecated
             */
            public static function setAutoResolve($automatic = true)
            {
            }

            /**
             * Alterna o "modo de bean parcial". Se este modo tiver
             * sido selecionado, o repositório atualizará apenas os
             * campos de um bean que foi alterado, e não o bean
             * inteiro. Passe o valor true para selecionar "modo parcial"
             * para todos os beans. Passe o valor false para desabilitar
             * o "modo parcial". Passe um array de tipos de bean se
             * desejar usar o modo parcial apenas para alguns tipos. Este
             * método retornará o valor anterior.
             *
             * @param boolean|string[] $yesNoBeans Lista de nomes de tipo ou "all".
             * @return boolean|string[].
             */
            public static function usePartialBeans($yesNoBeans)
            {
                return self::$redbean
                    ->getCurrentRepository()
                    ->usePartialBeans(
                        $yesNoBeans
                    );
            }

            /**
             * Expõe o resultado da consulta SQL especificada como
             * um arquivo CSV.
             *
             * Uso:
             *     <code>
             *         R::csv(
             *             "SELECT
             *                 `name`,
             *                 population
             *              FROM city
             *              WHERE region = :region ",
             *              array( ":region" => "Denmark" ),
             *              array( "city", "population" ),
             *              "/tmp/cities.csv"
             *         );
             *     </code>
             *
             * O comando acima selecionará todas as cidades na Dinamarca
             * e criará um CSV com as colunas "cidade" e "população" e
             * preencherá as células sob os cabeçalhos dessas colunas com
             * os nomes das cidades e os números da população,
             * respectivamente.
             *
             * @param string  $sql      Consulta SQL para expor o resultado.
             * @param array   $bindings Ligações de parâmetros.
             * @param array   $columns  Cabeçalhos de coluna para arquivo CSV.
             * @param string  $path     Caminho para salvar o arquivo CSV.
             * @param boolean $output   true para gerar CSV diretamente usando readfile.
             * @param array   $options  Delimitador, aspas e caractere de escape, respectivamente.
             * @return void.
             */
            public static function csv($sql = "", $bindings = array(), $columns = NULL, $path = "/tmp/redexport_%s.csv", $output = true)
            {
                $quickExport = new QuickExport(self::$toolbox);
                $quickExport->csv(
                    $sql,
                    $bindings,
                    $columns,
                    $path,
                    $output
                );
            }

            /**
             * MatchUp é um método poderoso de aumento de produtividade
             * que pode substituir scripts de controle simples por um
             * único comando RedBeanPHP. Normalmente, matchUp() é usado
             * para substituir scripts de login, scripts de geração de
             * token e scripts de redefinição de senha. O método MatchUp
             * utiliza um tipo de bean, um snippet de consulta
             * SQL (começando na cláusula WHERE), ligações SQL, um par de
             * arrays de tarefas e uma referência de bean.
             *
             * Se os 3 primeiros parâmetros corresponderem a um bean,
             * será considerada a primeira lista de tarefas, caso
             * contrário será considerada a segunda. Considerando cada
             * lista de tarefas, um vetor de chaves e valores será
             * executada. Cada chave na lista de tarefas deve
             * corresponder a uma propriedade do bean, enquanto cada
             * valor pode ser uma expressão a ser avaliada ou um
             * encerramento (PHP 5.3+). Após aplicar a lista de tarefas
             * ao bean ela será armazenada. Se nenhum bean for encontrado,
             * um novo bean será dispensado.
             *
             * This method will return true if the bean was found and false if not AND
             * there was a NOT-FOUND task list. If no bean was found AND there was also
             * no second task list, NULL will be returned.
             *
             * To obtain the bean, pass a variable as the sixth parameter.
             * The function will put the matching bean in the specified variable.
             *
             * @param string   $type         type of bean you're looking for
             * @param string   $sql          SQL snippet (starting at the WHERE clause, omit WHERE-keyword)
             * @param array    $bindings     array of parameter bindings for SQL snippet
             * @param array    $onFoundDo    task list to be considered on finding the bean
             * @param array    $onNotFoundDo task list to be considered on NOT finding the bean
             * @param OODBBean &$bean        reference to obtain the found bean
             *
             * @return bool|NULL
             */
            public static function matchUp($type, $sql, $bindings = array(), $onFoundDo = NULL, $onNotFoundDo = NULL, &$bean = NULL)
            {
                $matchUp = new MatchUp(
                    self::$toolbox
                );

                return $matchUp
                    ->matchUp(
                        $type,
                        $sql,
                        $bindings,
                        $onFoundDo,
                        $onNotFoundDo,
                        $bean
                    );
            }

            /**
             * @deprecated
             *
             * Retorna uma instância da classe Look Helper. A
             * instância será configurada com a caixa de
             * ferramentas atual.
             *
             * Nas versões anteriores do RedBeanPHP você tinha que
             * usar: R::getLook()->look() em vez de R::look(). No
             * entanto, para melhorar a usabilidade da biblioteca,
             * a função look() agora pode ser invocada diretamente
             * da fachada.
             *
             * Para mais detalhes sobre a funcionalidade Look,
             * consulte R::look().
             *
             * @see Facade::look.
             * @see Look::look.
             * @return Look.
             */
            public static function getLook()
            {
                return new Look(
                    self::$toolbox
                );
            }

            /**
             * Pega uma consulta SQL completa com ligações opcionais,
             * uma série de chaves, um modelo e, opcionalmente, uma
             * função de filtro e cola e monta uma visão de tudo isso.
             * Este é o caminho mais rápido do SQL para visualização.
             * Normalmente esta função é usada para gerar menus
             * suspensos (tag de seleção) com opções consultadas no
             * banco de dados.
             *
             * Uso:
             *     <code>
             *         $htmlPulldown = R::look(
             *             "SELECT * FROM color WHERE value != ? ORDER BY value ASC",
             *             [
             *                 "g"
             *             ],
             *             [
             *                 "value",
             *                 "name"
             *             ],
             *             "<option value="%s">%s</option>",
             *             "strtoupper",
             *             "\n"
             *         );
             *     </code>
             *
             * O exemplo acima cria um fragmento HTML como este:
             *     <option value="B">BLUE</option>
             *     <option value="R">RED</option>
             *
             * Para escolher uma cor de uma paleta. O fragmento HTML é
             * construído por uma consulta SQL que seleciona todas as
             * cores que não possuem valor "g" - isso exclui o verde.
             * A seguir, as propriedades "valor" e "nome" do bean são
             * mapeadas para a string do modelo HTML, observe que a
             * ordem aqui é importante. O mapeamento e a string do
             * modelo HTML seguem regras vsprintf. Todos os valores de
             * propriedade são então passados através da função de
             * filtro especificada "strtoupper" que neste caso é uma
             * função nativa do PHP para converter strings apenas em
             * caracteres maiúsculos. Finalmente, as strings de
             * fragmentos HTML resultantes são coladas usando um
             * caractere de nova linha especificado no último
             * parâmetro para facilitar a leitura.
             *
             * Nas versões anteriores do RedBeanPHP você tinha que
             * usar: R::getLook()->look() em vez de R::look(). No
             * entanto, para melhorar a usabilidade da biblioteca,
             * a função look() agora pode ser invocada diretamente
             * da fachada.
             *
             * @param string   $sql      Consulta a ser executada.
             * @param array    $bindings Parâmetros para vincular aos slots
             *                           mencionados na consulta ou a um vetor
             *                           vazio.
             * @param array    $keys     Nomes na coleção de resultados para
             *                           mapear para o modelo.
             * @param string   $template Modelo HTML para preencher com valores
             *                           associados às chaves, use a notação
             *                           printf (ou seja, %s).
             * @param callable $filter   Função para passar valores (para
             *                           tradução, por exemplo).
             * @param string   $glue     Cola opcional para usar ao unir as
             *                           cordas resultantes.
             * @return string.
             */
            public static function look($sql, $bindings = array(), $keys = array("selected", "id", "name"), $template = '<option %s value="%s">%s</option>', $filter = "trim", $glue = "")
            {
                return self::getLook()
                    ->look(
                        $sql,
                        $bindings,
                        $keys,
                        $template,
                        $filter,
                        $glue
                    );
            }

            /**
             * Calcula uma diferença entre dois beans (ou vetores
             * de beans). O resultado deste método é um array que
             * descreve as diferenças do segundo bean em relação
             * ao primeiro, onde o primeiro bean é tomado como
             * referência. O vetor é codificado por tipo/propriedade,
             * id e nome da propriedade, onde tipo/propriedade é o
             * tipo (no caso do bean raiz) ou a propriedade do bean
             * pai onde o tipo reside. As diferenças são destinadas
             * principalmente ao registro; você não pode aplicar
             * essas diferenças como patches a outros beans. No
             * entanto, esta funcionalidade poderá ser adicionada
             * no futuro.
             *
             * As chaves do array podem ser formatadas usando o
             * parâmetro $format. Uma chave será composta por um
             * caminho (1º), id (2º) e propriedade (3º). Usando a
             * notação estilo printf, você pode determinar o
             * formato exato da chave. O formato padrão será
             * semelhante a:
             *
             * "book.1.title" => array(<OLDVALUE>, <NEWVALUE>).
             *
             * Se você deseja apenas uma comparação simples de um
             * bean e não se importa com ids, você pode passar um
             * formato como: "%1$s.%3$s" que fornece:
             *
             * "book.1.title" => array(<OLDVALUE>, <NEWVALUE>).
             *
             * O parâmetro filter pode ser usado para definir filtros;
             * deve ser um vetor de nomes de propriedades que devem
             * ser ignoradas. Por padrão, este array é preenchido com
             * duas strings: "created" e "modified".
             *
             * @param OODBBean|OODBBean[] $bean    Bean de referência.
             * @param OODBBean|OODBBean[] $other   Beans para comparar.
             * @param array               $filters Nomes de propriedades de todos os
             *                                     beans a serem ignorados.
             * @param string              $pattern O formato da chave, o padrão
             *                                     é "%s.%s.%s".
             * @return array.
             */
            public static function diff($bean, $other, $filters = array("created", "modified"), $pattern = '%s.%s.%s')
            {
                $diff = new Diff(self::$toolbox);

                return $diff->diff(
                    $bean,
                    $other,
                    $filters,
                    $pattern
                );
            }

            /**
             * A maneira cavalheiresca de registrar uma instância
             * do RedBeanPHP ToolBox com a fachada. Armazena a caixa
             * de ferramentas no registro estático da caixa de
             * ferramentas da classe facade. Isso permite uma maneira
             * clara e explícita de registrar uma caixa de ferramentas.
             *
             * @param string  $key     Chave para armazenar a instância da
             *                         caixa de ferramentas.
             * @param ToolBox $toolbox Toolbox para registrar.
             * @return void.
             */
            public static function addToolBoxWithKey($key, ToolBox $toolbox)
            {
                self::$toolboxes[$key] = $toolbox;
            }

            /**
             * A maneira cavalheiresca de remover uma instância do
             * RedBeanPHP ToolBox da facade. Remove a caixa de
             * ferramentas identificada pela chave especificada no
             * registro da caixa de ferramentas estática da classe
             * facade. Isso permite uma maneira simples e explícita
             * de remover uma caixa de ferramentas. Retorna true se
             * a caixa de ferramentas especificada foi encontrada e
             * removida. Caso contrário, retornará false.
             *
             * @param string   $key Identificador da caixa de ferramentas
             *                      a ser removida.
             * @return boolean.
             */
            public static function removeToolBoxByKey($key)
            {
                if (!array_key_exists($key, self::$toolboxes))
                {
                    return false;
                }

                /**
                 *
                 */
                unset(self::$toolboxes[$key]);

                /**
                 *
                 */
                return true;
            }

            /**
             * Retorna a caixa de ferramentas associada à chave
             * especificada.
             *
             * @param string $key Chave para armazenar a instância da
             *                    caixa de ferramentas.
             * @return ToolBox|NULL.
             */
            public static function getToolBoxByKey($key)
            {
                if (!array_key_exists($key, self::$toolboxes))
                {
                    return NULL;
                }

                return self::$toolboxes[$key];
            }

            /**
             * Alterna os recursos da coluna JSON. Invocar este método
             * com booleano true faz com que 2 recursos JSON sejam
             * habilitados. Beans JSONificará automaticamente qualquer
             * array que não esteja em uma propriedade de lista e o
             * Query Writer (se for capaz) tentará criar uma coluna
             * JSON para strings que parecem conter JSON.
             *
             * Feature #1:
             *     AQueryWriter::useJSONColumns.
             *
             * Alterna o suporte para geração automática de colunas
             * JSON. Usar colunas JSON significa que strings contendo
             * JSON farão com que a coluna seja criada (não modificada)
             * como uma coluna JSON. No entanto, também pode desencadear
             * exceções se isso significar que o banco de dados tenta
             * converter uma coluna não json em uma coluna JSON.
             *
             * Feature #2:
             *     OODBBean::convertArraysToJSON
             *
             * Alterna vetor para conversão JSON. Se definido como
             * true, qualquer array definido como uma propriedade
             * de bean que não seja uma lista será transformado em
             * uma string JSON. Usado junto com AQueryWriter::useJSONColumns,
             * isso estende o suporte de tipo de dados para colunas
             * JSON.
             *
             * Portanto, invocar este método é o mesmo que:
             *     <code>
             *         AQueryWriter::useJSONColumns($flag);
             *         OODBBean::convertArraysToJSON($flag);
             *     </code>
             *
             * Diferente dos métodos acima, que retornam o
             * estado anterior, este método não retorna
             * nada (void).
             *
             * @param boolean $flag Sinalizador de recurso (true ou false).
             * @return void.
             */
            public static function useJSONFeatures($flag)
            {
                AQueryWriter::useJSONColumns($flag);
                OODBBean::convertArraysToJSON($flag);
            }

            /**
             * Dado um bean e um snippet SQL opcional, este método
             * retornará o bean junto com todos os beans filhos em
             * uma tabela de beans estruturada hierarquicamente.
             *
             * @observação que nem todos os bancos de dados suportam
             * esta funcionalidade. Você precisará de pelo menos
             * MariaDB 10.2.2 ou Postgres. Este método não inclui um
             * mecanismo de aviso caso seu banco de dados não suporte
             * esta funcionalidade.
             *
             * @param OODBBean    $bean     Bean para encontrar filhos de.
             * @param string|NULL $sql      Trecho SQL opcional.
             * @param array       $bindings Vinculações de parâmetros de
             *                              snippet SQL.
             * @return OODBBean[]
             */
            public static function children(OODBBean $bean, $sql = NULL, $bindings = array())
            {
                return self::$tree
                    ->children(
                        $bean,
                        $sql,
                        $bindings
                    );
            }

            /**
             * Dado um bean e um snippet SQL opcional, este
             * método contará todos os beans filhos em uma
             * tabela de beans estruturada hierarquicamente.
             *
             * @observação que nem todos os bancos de dados suportam
             * esta funcionalidade. Você precisará de pelo menos
             * MariaDB 10.2.2 ou Postgres. Este método não inclui um
             * mecanismo de aviso caso seu banco de dados não suporte
             * esta funcionalidade.
             *
             * @observação: Você tem permissão para usar ligações de
             * parâmetros nomeados, bem como ligações de parâmetros
             * numéricos (usando a notação de ponto de interrogação).
             * No entanto, você não pode misturar. Além disso, se
             * estiver usando ligações de parâmetros nomeados, a chave
             * de ligação de parâmetros ":slot0" será reservada para o
             * ID do bean e usada na consulta.
             *
             * @observação: Por padrão, se nenhuma seleção for fornecida
             * ou select=true este método subtrairá 1 do contador total
             * para omitir o bean inicial. Se você fornecer sua própria
             * seleção, este método pressupõe que você mesmo assume o
             * controle do total resultante, uma vez que não
             * pode "prever" o que ou como você está tentando "contar".
             *
             * @param OODBBean       $bean     Bean para encontrar filhos de.
             * @param string|NULL    $sql      Trecho SQL opcional.
             * @param array          $bindings Vinculações de parâmetros de snippet SQL.
             * @param string|boolean $select   Selecione o snippet a ser usado (avançado,
             *                                 opcional, consulte
             *                                 QueryWriter::queryRecursiveCommonTableExpression).
             * @return int.
             */
            public static function countChildren(OODBBean $bean, $sql = NULL, $bindings = array(), $select = QueryWriter::C_CTE_SELECT_COUNT)
            {
                return self::$tree->countChildren(
                    $bean,
                    $sql,
                    $bindings,
                    $select
                );
            }

            /**
             * Dado um bean e um snippet SQL opcional, este método
             * contará todos os beans pais em uma tabela de beans
             * estruturada hierarquicamente.
             *
             * @Observação, nem todos os bancos de dados suportam
             * esta funcionalidade. Você precisará de pelo menos
             * MariaDB 10.2.2 ou Postgres. Este método não inclui
             * um mecanismo de aviso caso seu banco de dados não
             * suporte esta funcionalidade.
             *
             * @Observação:
             * Você tem permissão para usar ligações de parâmetros
             * nomeados, bem como ligações de parâmetros numéricos (usando
             * a notação de ponto de interrogação). No entanto, você
             * não pode misturar. Além disso, se estiver usando
             * ligações de parâmetros nomeados, a chave de ligação
             * de parâmetros ":slot0" será reservada para o ID do
             * bean e usada na consulta.
             *
             * @Observação:
             * Por padrão, se nenhuma seleção for fornecida ou
             * select=true este método subtrairá 1 do contador
             * total para omitir o bean inicial. Se você fornecer
             * sua própria seleção, este método pressupõe que
             * você mesmo assume o controle do total resultante,
             * uma vez que não pode "prever" o que ou como você
             * está tentando "contar".
             *
             * @param OODBBean       $bean     Bean para encontrar filhos de.
             * @param string|NULL    $sql      Trecho SQL opcional.
             * @param array          $bindings Vinculações de parâmetros de snippet SQL.
             * @param string|boolean $select   Selecione o snippet a ser usado (avançado,
             *                                 opcional, consulte
             *                                 QueryWriter::queryRecursiveCommonTableExpression).
             * @return int.
             */
            public static function countParents(OODBBean $bean, $sql = NULL, $bindings = array(), $select = QueryWriter::C_CTE_SELECT_COUNT)
            {
                return self::$tree->countParents(
                    $bean,
                    $sql,
                    $bindings,
                    $select
                );
            }

            /**
             * Dado um bean e um snippet SQL opcional, este método
             * retornará o bean junto com todos os beans pai em uma
             * tabela de beans estruturada hierarquicamente.
             *
             * @observação que nem todos os bancos de dados suportam
             * esta funcionalidade. Você precisará de pelo menos
             * MariaDB 10.2.2 ou Postgres. Este método não inclui um
             * mecanismo de aviso caso seu banco de dados não suporte
             * esta funcionalidade.
             *
             * @param OODBBean    $bean     Bean para encontrar os pais de.
             * @param string|NULL $sql      Trecho SQL opcional.
             * @param array       $bindings Vinculações de parâmetros de snippet SQL.
             * @return OODBBean[].
             */
            public static function parents(OODBBean $bean, $sql = NULL, $bindings = array())
            {
                return self::$tree
                    ->parents(
                        $bean,
                        $sql,
                        $bindings
                    );
            }

            /**
             * Alterna o suporte para nuke(). Pode ser usado para
             * desligar o recurso nuke() por motivos de segurança.
             * Retorna o valor do sinalizador antigo.
             *
             * @param boolean $flag true ou false.
             * @return boolean.
             */
            public static function noNuke($yesNo)
            {
                return AQueryWriter::forbidNuke($yesNo);
            }

            /**
             * Método de serviço disponível globalmente para
             * RedBeanPHP. Converte uma sequência com snake case
             * em camel case. Se o parâmetro for um array, as
             * chaves serão convertidas.
             *
             * @param string|array $snake   snake_cased sequência para converter em camelCase.
             * @param boolean      $dolphin Exceção para IDs - (bookId -> bookID)
             *                              muito complicado para a mente humana,
             *                              apenas os golfinhos podem entender
             *                              isso.
             * @return string|array.
             */
            public static function camelfy($snake, $dolphin = false)
            {
                if (is_array($snake))
                {
                    $newArray = array();
                    foreach ($snake as $key => $value)
                    {
                        $newKey = self::camelfy($key, $dolphin);
                        if (is_array($value))
                        {
                            $value = self::camelfy(
                                $value,
                                $dolphin
                            );
                        }

                        $newArray[$newKey] = $value;
                    }

                    return $newArray;
                }

                return AQueryWriter::snakeCamel(
                    $snake,
                    $dolphin
                );
            }

            /**
             * Método de serviço disponível globalmente para RedBeanPHP.
             * Converte uma sequência camel case em snake case. Se o
             * parâmetro for um array, as chaves serão convertidas.
             *
             * @param string|array $camel camelCased string para converter em snake case.
             * @return string|array.
             */
            public static function uncamelfy($camel)
            {
                if (is_array($camel))
                {
                    $newArray = array();
                    foreach($camel as $key => $value)
                    {
                        $newKey = self::uncamelfy( $key );
                        if (is_array($value))
                        {
                            $value = self::uncamelfy(
                                $value
                            );
                        }

                        $newArray[ $newKey ] = $value;
                    }

                    return $newArray;
                }

                return AQueryWriter::camelsSnake(
                    $camel
                );
            }

            /**
             * Seleciona o conjunto de recursos desejado conforme
             * especificado pelo rótulo.
             *
             * Uso:
             *     <code>
             *         R::useFeatureSet("novice/latest");
             *     </code>
             *
             * @param string $label label.
             * @return void.
             */
            public static function useFeatureSet($label)
            {
                return Feature::feature($label);
            }

            /**
             * Estende dinamicamente a facade com um plugin. Usando
             * este método você pode registrar seu plugin com a facade
             * e então usar o plugin invocando o nome especificado do
             * plugin como um método na facade.
             *
             * Uso:
             *     <code>
             *         R::ext(
             *             "makeTea",
             *
             *             function()
             *             {
             *                 ...
             *             }
             *         );
             *     </code>
             *
             * Agora você pode usar seu plugin makeTea assim:
             *
             * <code>
             *     R::makeTea();
             * </code>
             *
             * @param string   $pluginName Nome do método para chamar o plugin.
             * @param callable $callable   Um PHP chamável.
             * @return void.
             */
            public static function ext($pluginName, $callable)
            {
                if (!preg_match('#^[a-zA-Z_][a-zA-Z0-9_]*$#', $pluginName))
                {
                    throw new RedException(
                        "Plugin name may only contain alphanumeric characters and underscores and cannot start with a number."
                    );
                }

                self::$plugins[$pluginName] = $callable;
            }

            /**
             * Chame static para uso com plug-ins dinâmicos. Este
             * método mágico irá interceptar chamadas estáticas e
             * encaminhá-las para o plugin especificado.
             *
             * @param string $pluginName Nome do plugin.
             * @param array  $params     Lista de argumentos a serem passados 
             *                           para o método plugin.
             * @return mixed.
             */
            public static function __callStatic($pluginName, $params)
            {
                if (!isset(self::$plugins[$pluginName]))
                {
                    if (!preg_match('#^[a-zA-Z_][a-zA-Z0-9_]*$#', $pluginName))
                    {
                        throw new RedException(
                            "Plugin name may only contain alphanumeric characters and underscores and cannot start with a number."
                        );
                    }

                    throw new RedException(
                        'Plugin \''.$pluginName.'\' does not exist, add this plugin using: R::ext(\''.$pluginName.'\')'
                    );
                }

                return call_user_func_array(self::$plugins[$pluginName], $params);
            }
        }
    }

    namespace RedBeanPHP
    {
        use RedBeanPHP\ToolBox as ToolBox;
        use RedBeanPHP\AssociationManager as AssociationManager;
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\QueryWriter\AQueryWriter as AQueryWriter;


        /**
         * Duplication Manager.
         * O Duplication Manager cria cópias profundas dos beans, o
         * que significa que pode duplicar uma hierarquia inteira de
         * beans. Você pode usar esse recurso para implementar o controle
         * de versão, por exemplo. Como a duplicação e a exportação estão
         * intimamente relacionadas, esta classe também é usada para
         * exportar beans recursivamente (ou seja, fazemos uma duplicata
         * e depois convertemos para array). Esta classe permite ajustar
         * o processo de duplicação especificando filtros que determinam
         * quais relações levar em consideração e especificando
         * tabelas (nesse caso, nenhuma consulta reflexiva precisa ser
         * emitida, melhorando assim o desempenho). Esta classe também
         * hospeda a função Camelfy usada para reformatar as chaves de
         * um array, este método está disponível publicamente e é usado
         * internamente por exportAll().
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class DuplicationManager
        {
            /**
             * @var ToolBox.
             */
            protected $toolbox;

            /**
             * @var AssociationManager.
             */
            protected $associationManager;

            /**
             * @var OODB.
             */
            protected $redbean;

            /**
             * @var array.
             */
            protected $tables = array();

            /**
             * @var array.
             */
            protected $columns = array();

            /**
             * @var array.
             */
            protected $filters = array();

            /**
             * @var boolean.
             */
            protected $cacheTables = false;

            /**
             * @var boolean.
             */
            protected $copyMeta = false;

            /**
             * Copia os beans compartilhados em um bean, ou seja,
             * todas as listas de sharedBean.
             *
             * @param OODBBean $copy   Bean alvo para copiar listas.
             * @param string   $shared Nome da lista compartilhada.
             * @param array    $beans  Array com beans compartilhados para copiar.
             * @return void.
             */
            private function copySharedBeans(OODBBean $copy, $shared, $beans)
            {
                $copy->$shared = array();
                foreach ($beans as $subBean)
                {
                    array_push(
                        $copy->$shared,
                        $subBean
                    );
                }
            }

            /**
             * Copie os próprios beans em um bean, ou seja, todas
             * as listas ownBean. Cada bean na lista pertence
             * exclusivamente ao seu proprietário, portanto,
             * precisamos invocar o método duplicado novamente
             * para duplicar cada bean aqui.
             *
             * @param OODBBean $copy        Bean alvo para copiar listas.
             * @param string   $owned       Nome da própria lista.
             * @param array    $beans       Array com beans compartilhados para copiar.
             * @param array    $trail       Array com beans anteriores para detectar recursão.
             * @param boolean  $preserveIDs true significa preservar IDs, apenas para exportação.
             * @return void.
             */
            private function copyOwnBeans(OODBBean $copy, $owned, $beans, $trail, $preserveIDs)
            {
                $copy->$owned = array();
                foreach ($beans as $subBean)
                {
                    array_push(
                        $copy->$owned,
                        $this->duplicate(
                            $subBean,
                            $trail,
                            $preserveIDs
                        )
                    );
                }
            }

            /**
             * Creates a copy of bean $bean and copies all primitive properties (not lists)
             * and the parents beans to the newly created bean. Also sets the ID of the bean
             * to 0.
             *
             * @param OODBBean $bean Bean para cópiar.
             * @return OODBBean.
             */
            private function createCopy(OODBBean $bean)
            {
                $type = $bean->getMeta("type");

                $copy = $this->redbean->dispense($type);
                $copy->setMeta("sys.dup-from-id", $bean->id);
                $copy->setMeta("sys.old-id", $bean->id);
                $copy->importFrom($bean);

                if ($this->copyMeta)
                {
                    $copy->copyMetaFrom($bean);
                }

                $copy->id = 0;

                return $copy;
            }

            /**
             * Gera uma chave a partir do tipo de bean e seu ID e
             * determina se o bean ocorre na trilha, caso contrário
             * o bean será adicionado à trilha. Retorna true se o
             * bean ocorrer na trilha e false caso contrário.
             *
             * @param array    $trail Lista de ex-beans.
             * @param OODBBean $bean  Beans atualmente selecionado.
             * @return boolean.
             */
            private function inTrailOrAdd(&$trail, OODBBean $bean)
            {
                $type = $bean->getMeta("type");
                $key = $type . $bean->getID();

                if (isset($trail[$key]))
                {
                    return true;
                }

                $trail[$key] = $bean;

                return false;
            }

            /**
             * Dado o nome do tipo de um bean, este método retorna
             * os nomes canônicos das propriedades da lista própria
             * e da lista compartilhada, respectivamente. Retorna
             * uma lista com dois elementos: nome da lista própria
             * e nome da lista compartilhada.
             *
             * @param string $typeName Nome do tipo bean.
             * @return array.
             */
            private function getListNames($typeName)
            {
                $owned  = "own" . ucfirst($typeName);
                $shared = "shared" . ucfirst($typeName);

                return array(
                    $owned,
                    $shared
                );
            }

            /**
             * Determina se o bean possui uma lista própria
             * com base na inspeção de esquema do esquema ou
             * cache em tempo real.
             *
             * @param string $type   Tipo de bean para obter a lista.
             * @param string $target Tipo de lista que você deseja detectar.
             * @return boolean.
             */
            protected function hasOwnList($type, $target)
            {
                return isset(
                    $this->columns[$target][$type . "_id"]
                );
            }

            /**
             * Determina se o bea possui uma lista compartilhada
             * com base na inspeção de esquema do esquema ou cache
             * em tempo real.
             *
             * @param string $type   Tipo de bean para obter a lista.
             * @param string $target Tipo de lista que você está procurando.
             * @return boolean.
             */
            protected function hasSharedList($type, $target)
            {
                return in_array(
                    AQueryWriter::getAssocTableFormat(
                        array(
                            $type,
                            $target
                        )
                    ),

                    $this->tables
                );
            }

            /**
             * @see DuplicationManager::dup.
             *
             * @param OODBBean $bean        Bean para cópiar.
             * @param array    $trail       Trilha para evitar loops infinitos.
             * @param boolean  $preserveIDs Preservar IDs.
             * @return OODBBean.
             */
            protected function duplicate(OODBBean $bean, $trail = array(), $preserveIDs = false)
            {
                if ($this->inTrailOrAdd($trail, $bean))
                {
                    return $bean;
                }

                $type = $bean->getMeta("type");
                $copy = $this->createCopy($bean);
                foreach ($this->tables as $table)
                {
                    if (!empty($this->filters))
                    {
                        if (!in_array($table, $this->filters))
                        {
                            continue;
                        }
                    }

                    list(
                        $owned,
                        $shared
                    ) = $this->getListNames($table);

                    if ($this->hasSharedList($type, $table))
                    {
                        if ($beans = $bean->$shared)
                        {
                            $this->copySharedBeans(
                                $copy,
                                $shared,
                                $beans
                            );
                        }
                    } elseif ($this->hasOwnList($type, $table))
                    {
                        if ($beans = $bean->$owned)
                        {
                            $this->copyOwnBeans(
                                $copy,
                                $owned,
                                $beans,
                                $trail,
                                $preserveIDs
                            );
                        }

                        $copy->setMeta("sys.shadow." . $owned, NULL);
                    }

                    $copy->setMeta("sys.shadow." . $shared, NULL);
                }

                $copy->id = (
                    $preserveIDs
                ) ? $bean->id : $copy->id;

                return $copy;
            }

            /**
             * Construtor,
             * cria uma nova instância do DupManager.
             *
             * @param ToolBox $toolbox.
             */
            public function __construct(ToolBox $toolbox)
            {
                $this->toolbox = $toolbox;
                $this->redbean = $toolbox->getRedBean();
                $this->associationManager = $this->redbean->getAssociationManager();
            }

            /**
             * Transforma recursivamente as chaves de um array
             * em camelCase.
             *
             * @param array   $array       Array para camelize.
             * @param boolean $dolphinMode Se você deseja a exceção para IDs.
             * @return array.
             */
            public function camelfy($array, $dolphinMode = false)
            {
                $newArray = array();
                foreach ($array as $key => $element)
                {
                    $newKey = preg_replace_callback('/_(\w)/', function($matches)
                    {
                        return strtoupper($matches[1]);
                    }, $key);

                    if ($dolphinMode)
                    {
                        $newKey = preg_replace( '/(\w)Id$/', '$1ID', $newKey );
                    }

                    $newArray[$newKey] = (
                        is_array($element)
                    ) ? $this->camelfy($element, $dolphinMode) : $element;
                }

                return $newArray;
            }

            /**
             * Para melhor desempenho você pode passar as tabelas em
             * um array para este método. Se as tabelas estiverem
             * disponíveis, o gerenciador de duplicação não as
             * consultará, portanto isso pode ser benéfico
             * para o desempenho.
             *
             * Este método permite dois formatos de array:
             *
             * <code>
             *     array(TABLE1, TABLE2 ...);
             * </code>
             *
             * ou
             *
             * <code>
             *     array(TABLE1 => array(COLUMN1, COLUMN2 ...) ...);
             * </code>
             *
             * @param array $tables Um vetor de cache de tabela.
             * @return void.
             */
            public function setTables($tables)
            {
                foreach ($tables as $key => $value)
                {
                    if (is_numeric($key))
                    {
                        $this->tables[] = $value;
                    } else
                    {
                        $this->tables[] = $key;
                        $this->columns[$key] = $value;
                    }
                }

                $this->cacheTables = true;
            }

            /**
             * Retorna um vetor de esquema para cache. Você pode
             * usar o valor de retorno deste método como cache,
             * armazená-lo na RAM ou no disco e passá-lo para
             * setTables posteriormente.
             *
             * @return array.
             */
            public function getSchema()
            {
                return $this->columns;
            }

            /**
             * Indica se você deseja que o gerenciador de duplicação
             * armazene em cache o esquema do banco de dados. Se este
             * sinalizador for definido como true, o gerenciador de
             * duplicação consultará o esquema do banco de dados
             * apenas uma vez. Caso contrário, o duplicationmanager
             * irá, por padrão, consultar o esquema toda vez que uma
             * ação de duplicação for executada (dup()).
             *
             * @param boolean $yesNo true para usar caching, false caso contrário.
             * @return void.
             */
            public function setCacheTables($yesNo)
            {
                $this->cacheTables = $yesNo;
            }

            /**
             * Um vetor de filtro é um vetor com nomes de tabelas.
             * Ao definir um filtro de tabela você pode fazer com
             * que o gerenciador de duplicação leve em consideração
             * apenas determinados tipos de beans. Outros tipos de
             * bean serão ignorados ao exportar ou fazer uma cópia
             * profunda. Se nenhum filtro for definido, todos os
             * tipos serão levados em consideração, este é o
             * comportamento padrão.
             *
             * @param array $filters Lista de tabelas a serem filtradas.
             * @return void.
             */
            public function setFilters($filters)
            {
                if (!is_array($filters))
                {
                    $filters = array(
                        $filters
                    );
                }

                $this->filters = $filters;
            }

            /**
             * Makes a copy of a bean. This method makes a deep copy
             * of the bean.The copy will have the following features.
             * - All beans in own-lists will be duplicated as well
             * - All references to shared beans will be copied but not the shared beans themselves
             * - All references to parent objects (_id fields) will be copied but not the parents themselves
             * In most cases this is the desired scenario for copying beans.
             * This function uses a trail-array to prevent infinite recursion, if a recursive bean is found
             * (i.e. one that already has been processed) the ID of the bean will be returned.
             * This should not happen though.
             *
             * Note:
             * This function does a reflectional database query so it may be slow.
             *
             * Note:
             * this function actually passes the arguments to a protected function called
             * duplicate() that does all the work. This method takes care of creating a clone
             * of the bean to avoid the bean getting tainted (triggering saving when storing it).
             *
             * @param OODBBean $bean        bean to be copied
             * @param array    $trail       for internal usage, pass array()
             * @param boolean  $preserveIDs for internal usage
             *
             * @return OODBBean
             */
            public function dup(OODBBean $bean, $trail = array(), $preserveIDs = false)
            {
                if (!count($this->tables))
                {
                    $this->tables = $this->toolbox->getWriter()->getTables();
                }

                if (!count($this->columns))
                {
                    foreach ($this->tables as $table)
                    {
                        $this->columns[$table] = $this->toolbox->getWriter()->getColumns($table);
                    }
                }

                $rs = $this->duplicate(
                    (
                        clone $bean
                    ),

                    $trail,
                    $preserveIDs
                );

                if (!$this->cacheTables)
                {
                    $this->tables = array();
                    $this->columns = array();
                }

                return $rs;
            }

            /**
             * Exporta uma coleção de beans recursivamente. Este
             * método exportará um array de beans no primeiro
             * argumento para um conjunto de arrays. Isso pode
             * ser usado para enviar representações JSON ou XML
             * de hierarquias de beans ao cliente.
             *
             * Para cada bean no array este método irá exportar:
             *     - conteúdo do bean.
             *     - todas as próprias listas de beans (recursivamente).
             *     - todos os beans compartilhados (mas não SUAS próprias listas).
             *
             * Se o segundo parâmetro for definido como true, os pais
             * dos beans no array também serão exportados (mas não
             * SEUS pais).
             *
             * O terceiro parâmetro pode ser usado para fornecer um
             * vetor de lista branca para filtragem. Esse é um vetor
             * de strings que representa nomes de tipos, apenas os
             * nomes de tipos na lista de filtros serão exportados.
             *
             * O quarto parâmetro pode ser usado para alterar as
             * chaves dos arrays de exportação resultantes. O modo
             * padrão é "snake case", mas isso deixa as chaves como
             * estão, porque "snake" é o estilo de caso padrão usado
             * pelo RedBeanPHP no banco de dados. Você pode definir
             * isso como "camel" para chaves com caixa de camelo ou
             * "dolphin" (o mesmo que camelcase, mas o id será
             * convertido em ID em vez de Id).
             *
             * @param array|OODBBean $beans     Bean a ser exportado.
             * @param boolean        $parents   Também exportar pais.
             * @param array          $filters   Apenas esses tipos (lista de permissões).
             * @param string         $caseStyle Identificador de estilo de caso.
             * @param boolean        $meta      Exportar metadados também.
             * @return array.
             */
            public function exportAll($beans, $parents = false, $filters = array(), $caseStyle = "snake", $meta = false)
            {
                $array = array();
                if (!is_array($beans))
                {
                    $beans = array($beans);
                }

                $this->copyMeta = $meta;
                foreach ($beans as $bean)
                {
                    $this->setFilters($filters);
                    $duplicate = $this->dup($bean, array(), true);
                    $array[] = $duplicate->export($meta, $parents, false, $filters);
                }

                if ($caseStyle === "camel")
                {
                    $array = $this->camelfy($array);
                }

                if ($caseStyle === "dolphin")
                {
                    $array = $this->camelfy($array, true);
                }

                return $array;
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\RedException as RedException;


        /**
         * Array Tool Helper.
         *
         * Este código fazia originalmente parte da fachada,
         * porém foi decidido remover recursos exclusivos de
         * classes de serviço como essa para torná-los
         * disponíveis para desenvolvedores que não usam a
         * classe fachada.
         *
         * Esta é uma classe auxiliar ou de serviço que contém
         * funções de array usadas com frequência para lidar
         * com consultas SQL.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class ArrayTool
        {
            /**
             * Gera espaços de ponto de interrogação para um
             * vetor de valores. Dado um array e uma string
             * de modelo opcional, este método produzirá uma
             * string contendo slots de parâmetros para uso
             * em uma string de consulta SQL.
             *
             * Uso:
             *     <code>
             *         R::genSlots(
             *             array("a", "b")
             *         );
             *     </code>
             *
             * A instrução no exemplo produzirá a string:
             * "?,?".
             *
             * Outro exemplo, usando uma string de modelo:
             *     <code>
             *         R::genSlots(
             *             array("a", "b"), " IN( %s ) "
             *         );
             *     </code>
             *
             * A instrução no exemplo produzirá a string:
             * " IN( ?,? ) ".
             *
             * @param array       $array    Array para gerar espaços de ponto
             *                              de interrogação.
             * @param string|NULL $template Template para usar.
             * @return string.
             */
            public static function genSlots($array, $template = NULL)
            {
                $str = count(
                    $array
                ) ? implode(",", array_fill(0, count($array), "?")) : "";

                return (
                    is_null(
                        $template
                    ) ||  $str === ""
                ) ? $str : sprintf($template, $str);
            }

            /**
             * Achata um array de ligações multidimensionais para
             * uso com genSlots().
             *
             * Uso:
             *     <code>
             *         R::flat(
             *             array("a", array("b"), "c")
             *         );
             *     </code>
             *
             * Produz um vetor como: [ "a", "b", "c" ].
             *
             * @param array $array  Vetor para achatar.
             * @param array $result Parâmetro de vetor de resultados (para recursão).
             * @return array.
             */
            public static function flat($array, $result = array())
            {
                foreach($array as $value)
                {
                    if (is_array($value))
                    {
                        $result = self::flat($value, $result);
                    } else
                    {
                        $result[] = $value;
                    }
                }

                return $result;
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\RedException as RedException;


        /**
         * Dispense Helper.
         * Uma classe auxiliar que contém um utilitário de
         * distribuição.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class DispenseHelper
        {
            /**
             * @var boolean.
             */
            private static $enforceNamingPolicy = true;

            /**
             * Define o sinalizador de política de nomenclatura
             * obrigatória. Se definido como true, a política
             * de nomenclatura RedBeanPHP será aplicada. Caso
             * contrário, não acontecerá. Use por sua conta e
             * risco. Definir isso como false não é recomendado.
             *
             * @param boolean $yesNo Se deve impor a política de nomes de RB.
             * @return void.
             */
            public static function setEnforceNamingPolicy($yesNo)
            {
                self::$enforceNamingPolicy = (boolean) $yesNo;
            }

            /**
             * Verifica se o tipo de bean está em conformidade com
             * a política de nomenclatura RedbeanPHP. Este método
             * lançará uma exceção se o tipo não estiver em
             * conformidade com a política de nomenclatura
             * de colunas do banco de dados RedBeanPHP.
             *
             * A política de nomenclatura RedBeanPHP para beans
             * afirma que nomes de tipos de bean válidos contêm
             * apenas:
             *     - Caracteres alfanuméricos minúsculos de a a z.
             *     - Números 0-9.
             *     - Pelo menos um personagem.
             *
             * Embora não haja restrições quanto ao comprimento,
             * implementações específicas de banco de dados podem
             * aplicar restrições adicionais em relação ao
             * comprimento de uma tabela, o que significa que essas
             * restrições também se aplicam aos tipos de bean.
             *
             * A política de nomenclatura RedBeanPHP garante que,
             * sem qualquer configuração, as funcionalidades
             * principais funcionem em muitos bancos de dados e
             * sistemas, incluindo aqueles que não diferenciam
             * maiúsculas de minúsculas ou são restritos ao
             * conjunto de caracteres ASCII.
             *
             * Embora essas restrições possam ser contornadas,
             * isso não é recomendado.
             *
             * @param string $type Tipo de bean.
             * @return void.
             */
            public static function checkType($type)
            {
                if (!preg_match('/^[a-z0-9]+$/', $type))
                {
                    throw new RedException(
                        "Invalid type: " . $type
                    );
                }
            }

            /**
             * Dispensa um novo RedBean OODB Bean para uso com o
             * restante dos métodos. RedBeanPHP pensa em beans,
             * o bean é a principal forma de interagir com o
             * RedBeanPHP e o banco de dados gerenciado pelo
             * RedBeanPHP. Para carregar, armazenar e excluir
             * dados do banco de dados usando RedBeanPHP você troca
             * esses RedBeanPHP OODB Beans. A única exceção a esta
             * regra são os métodos de consulta bruta como R::getCell()
             * ou R::exec() e assim por diante. O método dispense é
             * a "maneira preferida" de criar um novo bean.
             *
             * Uso:
             *     <code>
             *         $book = R::dispense("book");
             *         $book->title = "My Book";
             *         R::store($book);
             *     </code>
             *
             * Este método também pode ser usado para criar um gráfico
             * de bean inteiro de uma só vez. Dado um array com chaves
             * especificando os nomes das propriedades dos beans e uma
             * chave _type especial para indicar o tipo de bean, pode-se
             * fazer com que o Dispense Helper gere uma hierarquia inteira
             * de beans, incluindo listas. Para fazer dispense() gerar
             * uma lista, basta adicionar uma chave como: ownXList ou
             * sharedXList onde X é o tipo de beans que ele contém e
             * definir seu valor para um array preenchido com arrays
             * representando os beans. Observe que, embora o tipo possa
             * ter sido sugerido no nome da lista, você ainda precisa
             * especificar uma chave _type para cada array de bean na
             * lista. Observe que, se você especificar um array para
             * gerar um gráfico de bean, o parâmetro number será
             * ignorado.
             *
             * Uso:
             *     <code>
             *         $book = R::dispense([
             *             "_type" => "book",
             *             "title"  => "Gifted Programmers",
             *             "author" => [ "_type" => "author", "name" => "Xavier" ],
             *             "ownPageList" => [ ["_type"=>"page", "text" => "..."] ]
             *         ]);
             *     </code>
             *
             * @param string|array $typeOrBeanArray   Tipo ou vetor de bean a ser importada.
             * @param integer      $num               Número de grãos a dispensar.
             * @param boolean      $alwaysReturnArray Se true sempre retorna o resultado como um array.
             * @return OODBBean|OODBBean[].
             */
            public static function dispense(OODB $oodb, $typeOrBeanArray, $num = 1, $alwaysReturnArray = false)
            {
                if (is_array($typeOrBeanArray))
                {
                    if (!isset( $typeOrBeanArray["_type"]))
                    {
                        $list = array();
                        foreach($typeOrBeanArray as $beanArray)
                        {
                            if (!( is_array($beanArray) && isset($beanArray["_type"])))
                            {
                                throw new RedException(
                                    "Invalid Array Bean"
                                );
                            }
                        }

                        foreach ($typeOrBeanArray as $beanArray)
                        {
                            $list[] = self::dispense($oodb, $beanArray);
                        }

                        return $list;
                    }

                    $import = $typeOrBeanArray;
                    $type = $import["_type"];
                    unset($import["_type"]);
                } else
                {
                    $type = $typeOrBeanArray;
                }

                if (self::$enforceNamingPolicy)
                {
                    self::checkType($type);
                }

                $beanOrBeans = $oodb->dispense(
                    $type,
                    $num,
                    $alwaysReturnArray
                );

                if (isset($import))
                {
                    $beanOrBeans->import($import);
                }

                return $beanOrBeans;
            }

            /**
             * Pega uma lista separada por vírgulas de tipos
             * de beans e distribui esses grãos. Para cada
             * tipo da lista é possível especificar a
             * quantidade de grãos a serem dispensados.
             *
             * Uso:
             *     <code>
             *         list(
             *             $book,
             *             $page,
             *             $text
             *         ) = R::dispenseAll("book,page,text");
             *     </code>
             *
             * Isso dispensará um livro, uma página e um texto.
             * Dessa forma, você pode dispensar rapidamente beans
             * de vários tipos em apenas uma linha de código.
             *
             * Uso:
             *     <code>
             *         list(
             *             $book,
             *             $pages
             *         ) = R::dispenseAll("book,page*100");
             *     </code>
             *
             * Isso retorna um array com um bean de livro e
             * depois outro array contendo 100 beans de
             * página.
             *
             * @param OODB    $oodb       OODB.
             * @param string  $order      Uma descrição da ordem de distribuição
             *                            desejada usando a sintaxe acima.
             * @param boolean $onlyArrays Devolve apenas vetores, mesmo que amount < 2.
             * @return array.
             */
            public static function dispenseAll(OODB $oodb, $order, $onlyArrays = false)
            {
                $list = array();
                foreach (explode(",", $order) as $order)
                {
                    if (strpos($order, "*") !== false)
                    {
                        list(
                            $type,
                            $amount
                        ) = explode("*", $order);
                    } else
                    {
                        $type = $order;
                        $amount = 1;
                    }

                    $list[] = self::dispense(
                        $oodb,
                        $type,
                        $amount,
                        $onlyArrays
                    );
                }

                return $list;
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\OODBBean as OODBBean;


        /**
         * Dump helper.
         *
         * Este código fazia originalmente parte da facade,
         * porém foi decidido remover recursos exclusivos
         * de classes de serviço como essa para torná-los
         * disponíveis para desenvolvedores que não usam a
         * classe facade.
         *
         * Despeja o conteúdo de um bean em um array para
         * fins de depuração.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Dump
        {
            /**
             * Despeja os dados do bean no array. Dado um ou
             * mais beans, este método retornará um array
             * contendo a primeira parte da representação em
             * string de cada item do array.
             *
             * Uso:
             *     <code>
             *         echo R::dump($bean);
             *     </code>
             *
             * O exemplo mostra como fazer echo do resultado
             * de um despejo simples. Isso imprimirá a
             * representação de string do bean especificado
             * na tela, limitando a saída por bean a 35
             * caracteres para melhorar a legibilidade. Os
             * beans aninhados também serão descartados.
             *
             * @param OODBBean|array $data Um bean ou uma variedade de beans.
             * @return array.
             */
            public static function dump($data)
            {
                $array = array();
                if ($data instanceof OODBBean)
                {
                    $str = strval($data);
                    if (strlen($str) > 35)
                    {
                        $beanStr = substr($str, 0, 35)."... ";
                    } else
                    {
                        $beanStr = $str;
                    }

                    return $beanStr;
                }

                if (is_array($data))
                {
                    foreach ($data as $key => $item)
                    {
                        $array[$key] = self::dump($item);
                    }
                }

                return $array;
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\OODBBean as OODBBean;


        /**
         * Auxiliar do carregador Multi Bean.
         *
         * Este código fazia originalmente parte da fachada,
         * porém foi decidido remover recursos exclusivos de
         * classes de serviço como essa para torná-los
         * disponíveis para desenvolvedores que não usam a
         * classe facade.
         *
         * Esta classe auxiliar oferece suporte limitado para
         * relações um-para-um, fornecendo um serviço para
         * carregar um conjunto de beans com diferentes tipos
         * e um ID comum.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class MultiLoader
        {
            /**
             * Carrega vários tipos de beans com o mesmo ID. Este
             * pode parecer um método estranho, mas pode ser útil
             * para carregar uma relação um-para-um. Em uma relação
             * 1-1 típica, você tem dois registros compartilhando a
             * mesma chave primária. RedBeanPHP tem suporte limitado
             * apenas para relações 1-1. Em geral é recomendado usar
             * 1-N para isso.
             *
             * Uso:
             *     <code>
             *         list(
             *             $author,
             *             $bio
             *         ) = R::loadMulti("author, bio", $id);
             *     </code>
             *
             * @param OODB         $oodb  Objeto OODB.
             * @param string|array $types O conjunto de tipos a serem carregados
             *                            de uma vez.
             * @param mixed        $id    O ID comum.
             * @return OODBBean[].
             */
            public static function load(OODB $oodb, $types, $id)
            {
                if (is_string($types))
                {
                    $types = explode(",", $types);
                }

                if (!is_array($types))
                {
                    return array();
                }

                foreach ($types as $k => $typeItem)
                {
                    $types[$k] = $oodb->load($typeItem, $id);
                }

                return $types;
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\RedException as RedException;
        use RedBeanPHP\Adapter as Adapter;


        /**
         * Auxiliar de transação.
         *
         * Este código fazia originalmente parte da facade,
         * porém foi decidido remover recursos exclusivos de
         * classes de serviço como essa para torná-los
         * disponíveis para desenvolvedores que não usam a
         * classe facade.
         *
         * Auxiliar de transação de banco de dados. Esta é
         * uma classe de conveniência para realizar um retorno
         * de chamada em uma transação de banco de dados. Esta
         * classe contém um método para agrupar seu retorno de
         * chamada em uma transação.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Transaction
        {
            /**
             * Envolve uma transação em torno de um fechamento ou
             * retorno de chamada de string. Se uma exceção for
             * lançada internamente, a operação será automaticamente
             * revertida. Se nenhuma exceção acontecer, ele será
             * confirmado automaticamente. Ele também suporta
             * transações aninhadas (simuladas) (o que é útil
             * quando você tem muitos métodos que precisam de
             * transações, mas não têm conhecimento uns dos
             * outros).
             *
             * Exemplo:
             *     <code>
             *         $from = 1;
             *         $to = 2;
             *         $amount = 300;
             *
             *         R::transaction(function() use($from, $to, $amount)
             *         {
             *             $accountFrom = R::load("account", $from);
             *             $accountTo = R::load("account", $to);
             *             $accountFrom->money -= $amount;
             *             $accountTo->money += $amount;
             *
             *             R::store($accountFrom);
             *             R::store($accountTo);
             *         });
             *     </code>
             *
             * @param Adapter  $adapter  Adaptador de banco de dados que
             *                           fornece mecanismos de transação.
             * @param callable $callback Fechamento (ou outro chamável) com
             *                           a lógica da transação.
             * @return mixed.
             */
            public static function transaction(Adapter $adapter, $callback)
            {
                if (!is_callable($callback))
                {
                    throw new RedException(
                        "R::transaction needs a valid callback."
                    );
                }

                static $depth = 0;
                $result = null;

                try
                {
                    if ($depth == 0)
                    {
                        $adapter->startTransaction();
                    }

                    $depth++;

                    /**
                     * Manter a compatibilidade 5.2.
                     */
                    $result = call_user_func($callback);
                    $depth--;

                    if ($depth == 0)
                    {
                        $adapter->commit();
                    }
                } catch (\Exception $exception)
                {
                    $depth--;
                    if ($depth == 0)
                    {
                        $adapter->rollback();
                    }

                    throw $exception;
                }

                return $result;
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\ToolBox as ToolBox;


        /**
         * Utilitário de exportação rápida.
         *
         * A classe Quick Export Utility fornece funcionalidade
         * para expor facilmente o resultado de consultas SQL
         * em formatos conhecidos, como CSV.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class QuickExport
        {
            /**
             * @var ToolBox.
             */
            protected $toolbox;

            /**
             * @var boolean.
             */
            private static $test = false;

            /**
             * Construtor.
             * A Exportação Rápida requer uma caixa de ferramentas.
             *
             * @param ToolBox $toolbox.
             */
            public function __construct(ToolBox $toolbox)
            {
                $this->toolbox = $toolbox;
            }

            /**
             * Makes csv() testable.
             *
             * @param string $name.
             * @param mixed $arg1.
             * @param boolean $arg2.
             *
             * @return mixed.
             */
            public static function operation($name, $arg1, $arg2 = true)
            {
                $out = "";
                switch ($name)
                {
                    case "test":
                        self::$test = (boolean) $arg1;
                        break;

                    case "header":
                        $out = (self::$test) ? $arg1 : header($arg1, $arg2);
                        break;

                    case "readfile":
                        $out = (self::$test) ? file_get_contents($arg1) : readfile($arg1);
                        break;

                    case "exit":
                        $out = (self::$test) ? "exit" : exit();
                        break;
                }

                return $out;
            }

            /**
             * Expõe o resultado da consulta SQL especificada como
             * um arquivo CSV.
             *
             * Uso:
             *     <code>
             *         R::csv(
             *             "SELECT
             *                 `name`,
             *                 population
             *              FROM city
             *              WHERE region = :region ",
             *              array(":region" => "Denmark"),
             *              array("city", "population"),
             *              "/tmp/cities.csv"
             *         );
             *     </code>
             *
             * O comando acima selecionará todas as cidades na Dinamarca
             * e criará um CSV com as colunas "cidade" e "população" e
             * preencherá as células sob os cabeçalhos dessas colunas
             * com os nomes das cidades e os números da população,
             * respectivamente.
             *
             * @param string  $sql      Consulta SQL para expor o resultado.
             * @param array   $bindings Ligações de parâmetros.
             * @param array   $columns  Cabeçalhos de coluna para arquivo CSV.
             * @param string  $path     Caminho para salvar o arquivo CSV.
             * @param boolean $output   true para gerar CSV diretamente usando readfile.
             * @param array   $options  Delimitador, aspas e caractere de escape, respectivamente.
             * @return string|NULL.
             */
            public function csv($sql = "", $bindings = array(), $columns = NULL, $path = '/tmp/redexport_%s.csv', $output = true, $options = array(",", "\"", "\\"))
            {
                list(
                    $delimiter,
                    $enclosure,
                    $escapeChar
                ) = $options;

                $path = sprintf($path, date("Ymd_his"));
                $handle = fopen($path, "w");
                if ($columns)
                {
                    if (PHP_VERSION_ID >= 505040)
                    {
                        fputcsv(
                            $handle,
                            $columns,
                            $delimiter,
                            $enclosure,
                            $escapeChar
                        );
                    } else
                    {
                        fputcsv(
                            $handle,
                            $columns,
                            $delimiter,
                            $enclosure
                        );
                    }
                }

                $cursor = $this
                    ->toolbox
                    ->getDatabaseAdapter()
                    ->getCursor(
                        $sql,
                        $bindings
                    );

                while ($row = $cursor->getNextItem())
                {
                    if (PHP_VERSION_ID >= 505040)
                    {
                        fputcsv(
                            $handle,
                            $row,
                            $delimiter,
                            $enclosure,
                            $escapeChar
                        );
                    } else
                    {
                        fputcsv(
                            $handle,
                            $row,
                            $delimiter,
                            $enclosure
                        );
                    }
                }

                fclose($handle);
                if ($output)
                {
                    $file = basename($path);
                    $out = self::operation("header", "Pragma: public");
                    $out .= self::operation("header", "Expires: 0");
                    $out .= self::operation("header", "Cache-Control: must-revalidate, post-check=0, pre-check=0");

                    $out .= self::operation("header", "Cache-Control: private", false);
                    $out .= self::operation("header", "Content-Type: text/csv");
                    $out .= self::operation("header", "Content-Disposition: attachment; filename={$file}");
                    $out .= self::operation("header", "Content-Transfer-Encoding: binary");
                    $out .= self::operation("readfile", $path);

                    @unlink($path);
                    self::operation("exit", false);
                    return $out;
                }
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\ToolBox as ToolBox;
        use RedBeanPHP\Finder;


        /**
         * Utilitário MatchUp.
         *
         * Cansado de criar sistemas de login e sistemas de
         * esquecimento de senha ? MatchUp é uma tradução ORM
         * desse tipo de problema. Um matchUp é uma combinação
         * de correspondência e atualização em termos de beans.
         * Normalmente, os problemas relacionados ao login
         * envolvem uma correspondência e uma atualização
         * condicional.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class MatchUp
        {
            /**
             * @var Toolbox.
             */
            protected $toolbox;

            /**
             * Construtor.
             * A classe MatchUp requer uma caixa de ferramentas.
             *
             * @param ToolBox $toolbox.
             */
            public function __construct(ToolBox $toolbox)
            {
                $this->toolbox = $toolbox;
            }

            /**
             * MatchUp é um método poderoso de aumento de produtividade
             * que pode substituir scripts de controle simples por um
             * único comando RedBeanPHP. Normalmente, matchUp() é usado
             * para substituir scripts de login, scripts de geração de
             * token e scripts de redefinição de senha. O método MatchUp
             * utiliza um tipo de bean, um snippet de consulta
             * SQL (começando na cláusula WHERE), ligações SQL, um par
             * de arrays de tarefas e uma referência de bean.
             *
             * Se os 3 primeiros parâmetros corresponderem a um bean,
             * será considerada a primeira lista de tarefas, caso
             * contrário será considerada a segunda. Considerando cada
             * lista de tarefas, um vetor de chaves e valores será
             * executada. Cada chave na lista de tarefas deve
             * corresponder a uma propriedade do bean, enquanto cada
             * valor pode ser uma expressão a ser avaliada ou um
             * encerramento (PHP 5.3+). Após aplicar a lista de tarefas
             * ao bean ela será armazenada. Se nenhum bean for encontrado,
             * um novo bean será dispensado.
             *
             * Este método retornará true se o bean foi encontrado e
             * false se não e houve uma lista de tarefas NOT-FOUND.
             * Se nenhum bean foi encontrado e também não houve uma
             * segunda lista de tarefas, NULL será retornado.
             *
             * Para obter o bean, passe uma variável como sexto
             * parâmetro. A função colocará o bean correspondente
             * na variável especificada.
             *
             * Uso (este exemplo redefine uma senha de uma só vez):
             *     <code>
             *         $newpass = "1234";
             *         $didResetPass = R::matchUp(
             *             "account",
             *             " token = ? AND tokentime > ? ",
             *             [
             *                 $token, time() - 100
             *             ],
             *             [
             *                 "pass" => $newpass,
             *                 "token" => ""
             *             ],
             *             NULL,
             *             $account
             *         );
             *     </code>
             *
             * @param string        $type         Tipo de bean que você está procurando.
             * @param string        $sql          Snippet SQL (começando na cláusula
             *                                    WHERE, omita a palavra-chave WHERE).
             * @param array         $bindings     Vetor de ligações de parâmetros para
             *                                    snippet SQL.
             * @param array|NULL    $onFoundDo    Lista de tarefas a serem consideradas
             *                                    ao encontrar o bean.
             * @param array|NULL    $onNotFoundDo Lista de tarefas a serem consideradas
             *                                    ao NÃO encontrar o bean.
             * @param OODBBean|NULL &$bean        Referência para obter o bean encontrado.
             * @return bool|NULL.
             */
            public function matchUp($type, $sql, $bindings = array(), $onFoundDo = NULL, $onNotFoundDo = NULL, &$bean = NULL)
            {
                $finder = new Finder($this->toolbox);
                $oodb = $this->toolbox->getRedBean();
                $bean = $finder->findOne($type, $sql, $bindings);

                if ($bean && $onFoundDo)
                {
                    foreach($onFoundDo as $property => $value)
                    {
                        if (function_exists("is_callable") && is_callable($value))
                        {
                            $bean[$property] = call_user_func_array(
                                $value,

                                array(
                                    $bean
                                )
                            );
                        } else
                        {
                            $bean[$property] = $value;
                        }
                    }

                    $oodb->store($bean);

                    return true;
                }

                if ($onNotFoundDo)
                {
                    $bean = $oodb->dispense($type);
                    foreach($onNotFoundDo as $property => $value)
                    {
                        if (function_exists("is_callable") && is_callable($value))
                        {
                            $bean[$property] = call_user_func_array(
                                $value,

                                array(
                                    $bean
                                )
                            );
                        } else
                        {
                            $bean[$property] = $value;
                        }
                    }

                    $oodb->store($bean);

                    return false;
                }

                return NULL;
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\ToolBox as ToolBox;
        use RedBeanPHP\Finder;


        /**
         * Veja Utilitário.
         *
         * A classe Look Utility fornece uma maneira fácil de
         * gerar tabelas e seleções (pulldowns) do banco de
         * dados.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Look
        {
            /**
             * @var Toolbox.
             */
            protected $toolbox;

            /**
             * Construtor.
             * A classe MatchUp requer uma caixa de ferramentas.
             *
             * @param ToolBox $toolbox.
             */
            public function __construct(ToolBox $toolbox)
            {
                $this->toolbox = $toolbox;
            }

            /**
             * Pega uma consulta SQL completa com ligações opcionais,
             * uma série de chaves, um modelo e, opcionalmente, uma
             * função de filtro e cola e monta uma visão de tudo isso.
             * Este é o caminho mais rápido do SQL para visualização.
             * Normalmente esta função é usada para gerar menus
             * suspensos (tag de seleção) com opções consultadas no
             * banco de dados.
             *
             * Uso:
             *     <code>
             *         $htmlPulldown = R::look(
             *             "SELECT * FROM color WHERE value != ? ORDER BY value ASC",
             *             [
             *                 "g"
             *             ],
             *             [
             *                 "value",
             *                 "name"
             *             ],
             *             "<option value="%s">%s</option>",
             *             "strtoupper",
             *             "\n"
             *         );
             *     </code>
             *
             * O exemplo acima cria um fragmento HTML como este:
             *     <option value="B">BLUE</option>
             *     <option value="R">RED</option>
             *
             * Para escolher uma cor de uma paleta. O fragmento HTML
             * é construído por uma consulta SQL que seleciona todas
             * as cores que não possuem valor "g" - isso exclui o
             * verde. A seguir, as propriedades "value" e "name" do
             * bean são mapeadas para a string do modelo HTML,
             * observe que a ordem aqui é importante. O mapeamento
             * e a string do modelo HTML seguem regras vsprintf.
             * Todos os valores de propriedade são então passados
             * através da função de filtro especificada "strtoupper"
             * que neste caso é uma função nativa do PHP para
             * converter strings apenas em caracteres maiúsculos.
             * Finalmente, as strings de fragmentos HTML resultantes
             * são coladas usando um caractere de nova linha
             * especificado no último parâmetro para facilitar a
             * leitura.
             *
             * Nas versões anteriores do RedBeanPHP você tinha que
             * usar: R::getLook()->look() em vez de R::look(). No
             * entanto, para melhorar a usabilidade da biblioteca,
             * a função look() agora pode ser invocada diretamente
             * da facade.
             *
             * @param string   $sql      Consulta para executar.
             * @param array    $bindings Parâmetros para vincular aos slots
             *                           mencionados na consulta ou a um vetor
             *                           vazio.
             * @param array    $keys     Nomes na coleção de resultados para
             *                           mapear para o modelo.
             * @param string   $template Modelo HTML para preencher com valores
             *                           associados às chaves, use a notação
             *                           printf (ou seja, %s).
             * @param callable $filter   Função para passar valores (para
             *                           tradução, por exemplo).
             * @param string   $glue     Cola opcional para usar ao unir as
             *                           cordas resultantes.
             * @return string.
             */
            public function look($sql, $bindings = array(), $keys = array("selected", "id", "name"), $template = '<option %s value="%s">%s</option>', $filter = "trim", $glue = "")
            {
                $adapter = $this->toolbox->getDatabaseAdapter();
                $lines = array();
                $rows = $adapter->get($sql, $bindings);

                foreach ($rows as $row)
                {
                    $values = array();
                    foreach ($keys as $key)
                    {
                        if (!empty($filter))
                        {
                            $values[] = call_user_func_array(
                                $filter,
                                array(
                                    $row[$key]
                                )
                            );
                        } else
                        {
                            $values[] = $row[$key];
                        }
                    }

                    $lines[] = vsprintf($template, $values);
                }

                $string = implode($glue, $lines);

                return $string;
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\OODB as OODB;
        use RedBeanPHP\OODBBean as OODBBean;
        use RedBeanPHP\ToolBox as ToolBox;
        use RedBeanPHP\Finder;


        /**
         * Utilitário diferencial.
         * A classe Look Utility fornece uma maneira fácil
         * de gerar tabelas e seleções (pulldowns) do banco
         * de dados.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Diff
        {
            /**
             * @var Toolbox.
             */
            protected $toolbox;

            /**
             * Construtor.
             * A classe MatchUp requer uma caixa de ferramentas.
             *
             * @param ToolBox $toolbox.
             */
            public function __construct(ToolBox $toolbox)
            {
                $this->toolbox = $toolbox;
            }

            /**
             * Calcula uma diferença entre dois beans (ou vetores
             * de beans). O resultado deste método é um array que
             * descreve as diferenças do segundo bean em relação
             * ao primeiro, onde o primeiro bean é tomado como
             * referência. O vetor é codificada por tipo/propriedade,
             * id e nome da propriedade, onde tipo/propriedade é
             * o tipo (no caso do bean raiz) ou a propriedade do
             * bean pai onde o tipo reside. As diferenças são
             * destinadas principalmente ao registro; você não
             * pode aplicar essas diferenças como patches a outros
             * beans. No entanto, esta funcionalidade poderá ser
             * adicionada no futuro.
             *
             * As chaves do array podem ser formatadas usando o
             * parâmetro $format. Uma chave será composta por um
             * caminho (1º), id (2º) e propriedade (3º). Usando
             * a notação estilo printf, você pode determinar o
             * formato exato da chave. O formato padrão será
             * semelhante a:
             *
             * "book.1.title" => array(
             *     <OLDVALUE>,
             *     <NEWVALUE>
             * );
             *
             * Se você deseja apenas uma comparação simples de um
             * bean e não se importa com ids, você pode passar um
             * formato como: "%1$s.%3$s" que fornece:
             *
             * "book.1.title" => array(
             *     <OLDVALUE>,
             *     <NEWVALUE>
             * );
             *
             * O parâmetro filter pode ser usado para definir filtros;
             * deve ser um vetor de nomes de propriedades que devem ser
             * ignoradas. Por padrão, este array é preenchido com duas
             * strings: "created" e "modified".
             *
             * @param OODBBean|array $beans   Bean de referência.
             * @param OODBBean|array $others  Beans para comparar.
             * @param array          $filters Nomes de propriedades de todos os
             *                                beans a serem ignorados.
             * @param string         $format  O formato da chave, o padrão
             *                                é "%s.%s.%s".
             * @param string|NULL    $type    Tipo/propriedade do bean a ser
             *                                usado para geração de chave.
             * @return array.
             */
            public function diff($beans, $others, $filters = array("created", "modified"), $format = '%s.%s.%s', $type = NULL)
            {
                $diff = array();

                if (!is_array($beans))
                {
                    $beans = array($beans);
                }

                $beansI = array();
                foreach ($beans as $bean)
                {
                    if (!($bean instanceof OODBBean))
                    {
                        continue;
                    }

                    $beansI[$bean->id] = $bean;
                }

                if (!is_array($others))
                {
                    $others = array($others);
                }

                $othersI = array();
                foreach ($others as $other)
                {
                    if (!($other instanceof OODBBean))
                    {
                        continue;
                    }

                    $othersI[$other->id] = $other;
                }

                if (count($beansI) == 0 || count($othersI) == 0)
                {
                    return array();
                }

                $type = $type != NULL ? $type : reset($beansI)->getMeta("type");
                foreach($beansI as $id => $bean)
                {
                    if (!isset($othersI[$id]))
                    {
                        continue;
                    }

                    $other = $othersI[$id];
                    foreach ($bean as $property => $value)
                    {
                        if (in_array($property, $filters))
                        {
                            continue;
                        }

                        /**
                         *
                         */
                        $key = vsprintf(
                            $format,
                            array(
                                $type,
                                $bean->id,
                                $property
                            )
                        );

                        $compare = $other->{$property};
                        if (!is_object($value) && !is_array($value) && $value != $compare)
                        {
                            $diff[$key] = array( $value, $compare );
                        } else
                        {
                            $diff = array_merge(
                                $diff,
                                $this->diff(
                                    $value,
                                    $compare,
                                    $filters,
                                    $format,
                                    $key
                                )
                            );
                        }
                    }
                }

                return $diff;
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\ToolBox;
        use RedBeanPHP\OODB;
        use RedBeanPHP\OODBBean;
        use RedBeanPHP\QueryWriter;


        /**
         * Árvore.
         *
         * Dado um bean, encontra-se seus filhos ou pais
         * em uma estrutura hierárquica.
         *
         * @experimental feature.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Tree
        {
            /**
             * @var ToolBox.
             */
            protected $toolbox;

            /**
             * @var QueryWriter.
             */
            protected $writer;

            /**
             * @var OODB.
             */
            protected $oodb;

            /**
             * Construtor, cria uma nova instância da Árvore.
             *
             * @param ToolBox $toolbox toolbox.
             */
            public function __construct(ToolBox $toolbox)
            {
                $this->toolbox = $toolbox;
                $this->writer = $toolbox->getWriter();
                $this->oodb = $toolbox->getRedBean();
            }

            /**
             * Retorna todos os beans filhos associados ao bean
             * especificado em uma estrutura em árvore.
             *
             * @observação, isso funciona apenas para bancos de
             * dados que suportam expressões de tabela comum
             * recursivas.
             *
             * Uso:
             *     <code>
             *         $newsArticles = R::children($newsPage, " ORDER BY title ASC ");
             *         $newsArticles = R::children($newsPage, " WHERE title = ? ", [ $t ]);
             *         $newsArticles = R::children($newsPage, " WHERE title = :t ", [ ":t" => $t ]);
             *     </code>
             *
             * Observação:
             * Você tem permissão para usar ligações de parâmetros
             * nomeados, bem como ligações de parâmetros numéricos
             * (usando a notação de ponto de interrogação). No
             * entanto, você não pode misturar. Além disso, se
             * estiver usando ligações de parâmetros nomeados, a
             * chave de ligação de parâmetros ":slot0" será
             * reservada para o ID do bean e usada na consulta.
             *
             * @param OODBBean    $bean     Bean de referência para encontrar filhos.
             * @param string|NULL $sql      Trecho SQL opcional.
             * @param array       $bindings Ligações de parâmetros opcionais
             *                              para snippet SQL.
             * @return array.
             */
            public function children(OODBBean $bean, $sql = NULL, $bindings = array())
            {
                $type = $bean->getMeta("type");
                $id = $bean->id;

                $rows = $this
                    ->writer
                    ->queryRecursiveCommonTableExpression(
                        $type,
                        $id, false,
                        $sql,
                        $bindings
                    );

                return $this->oodb->convertToBeans($type, $rows);
            }

            /**
             * Retorna todos os beans pais associados ao bean
             * especificado em uma estrutura em árvore.
             *
             * @observação isso funciona apenas para bancos
             * de dados que suportam expressões de tabela
             * comum recursivas.
             *
             * <code>
             *     $newsPages = R::parents($newsArticle, " ORDER BY title ASC ");
             *     $newsPages = R::parents($newsArticle, " WHERE title = ? ", [$t]);
             *     $newsPages = R::parents($newsArticle, " WHERE title = :t ", [":t" => $t]);
             * </code>
             *
             * Observação:
             * Você tem permissão para usar ligações de parâmetros
             * nomeados, bem como ligações de parâmetros numéricos
             * (usando a notação de ponto de interrogação). No
             * entanto, você não pode misturar. Além disso, se
             * estiver usando ligações de parâmetros nomeados, a
             * chave de ligação de parâmetros ":slot0" será
             * reservada para o ID do bean e usada na
             * consulta.
             *
             * @param OODBBean    $bean     Bean de referência para encontrar
             *                              os pais.
             * @param string|NULL $sql      Trecho SQL opcional.
             * @param array       $bindings Ligações de parâmetros opcionais
             *                              para snippet SQL.
             * @return array.
             */
            public function parents(OODBBean $bean, $sql = NULL, $bindings = array())
            {
                $type = $bean->getMeta("type");
                $id = $bean->id;

                $rows = $this
                    ->writer
                    ->queryRecursiveCommonTableExpression(
                        $type,
                        $id, true,
                        $sql,
                        $bindings
                    );

                return $this->oodb->convertToBeans($type, $rows);
            }

            /**
             * Conta todos os beans filhos associados ao bean
             * especificado em uma estrutura de árvore.
             *
             * @observação, isso funciona apenas para bancos
             * de dados que suportam expressões de tabela
             * comum recursivas.
             *
             * <code>
             *     $count = R::countChildren($newsArticle);
             *     $count = R::countChildren($newsArticle, " WHERE title = ? ", [$t]);
             *     $count = R::countChildren($newsArticle, " WHERE title = :t ", [":t" => $t]);
             * </code>
             *
             * @observação: Você tem permissão para usar ligações
             * de parâmetros nomeados, bem como ligações de parâmetros
             * numéricos (usando a notação de ponto de interrogação).
             * No entanto, você não pode misturar. Além disso, se
             * estiver usando ligações de parâmetros nomeados, a
             * chave de ligação de parâmetros ":slot0" será
             * reservada para o ID do bean e usada na consulta.
             *
             * @observação: Por padrão, se nenhum SQL ou select for
             * fornecido ou select=true este método subtrairá 1 do
             * contador total para omitir o bean inicial. Se você
             * fornecer sua própria seleção, este método pressupõe
             * que você mesmo assume o controle do total resultante,
             * uma vez que não pode "prever" o que ou como você está
             * tentando "contar".
             *
             * @param OODBBean       $bean     Bean de referência para encontrar filhos.
             * @param string|NULL    $sql      Trecho SQL opcional.
             * @param array          $bindings Ligações de parâmetros opcionais
             *                                 para snippet SQL.
             * @param string|boolean $select   Selecione o snippet a ser usado (
             *                                 avançado, opcional, consulte
             *                                 QueryWriter::queryRecursiveCommonTableExpression).
             * @return integer.
             */
            public function countChildren(OODBBean $bean, $sql = NULL, $bindings = array(), $select = true)
            {
                $type = $bean->getMeta("type");
                $id = $bean->id;
                $rows = $this
                    ->writer
                    ->queryRecursiveCommonTableExpression(
                        $type,
                        $id, false,
                        $sql,
                        $bindings,
                        $select
                    );

                $first = reset($rows);
                $cell = reset($first);

                return (
                    intval($cell) - (
                        (
                            $select === true && is_null($sql)
                        ) ? 1 : 0
                    )
                );
            }

            /**
             * Conta todos os beans pais associados ao bean
             * especificado em uma estrutura em árvore.
             *
             * @observação isso funciona apenas para bancos
             * de dados que suportam expressões de tabela
             * comum recursivas.
             *
             * <code>
             *     $count = R::countParents($newsArticle);
             *     $count = R::countParents($newsArticle, " WHERE title = ? ", [$t]);
             *     $count = R::countParents($newsArticle, " WHERE title = :t ", [":t" => $t]);
             * </code>
             *
             * Observação: Você tem permissão para usar ligações
             * de parâmetros nomeados, bem como ligações de parâmetros
             * numéricos (usando a notação de ponto de interrogação).
             * No entanto, você não pode misturar. Além disso, se
             * estiver usando ligações de parâmetros nomeados, a
             * chave de ligação de parâmetros ":slot0" será reservada
             * para o ID do bean e usada na consulta.
             *
             * Observação:
             * Por padrão, se nenhum SQL ou select for fornecido ou
             * select=true este método subtrairá 1 do contador total
             * para omitir o bean inicial. Se você fornecer sua própria
             * seleção, este método pressupõe que você mesmo assume o
             * controle do total resultante, uma vez que não pode "prever"
             * o que ou como você está tentando "contar".
             *
             * @param OODBBean       $bean     Bean de referência para encontrar os pais.
             * @param string|NULL    $sql      Trecho SQL opcional.
             * @param array          $bindings Ligações de parâmetros opcionais
             *                                 para snippet SQL.
             * @param string|boolean $select   Selecione o snippet a ser usado (
             *                                 avançado, opcional, consulte
             *                                 QueryWriter::queryRecursiveCommonTableExpression).
             * @return integer.
             */
            public function countParents(OODBBean $bean, $sql = NULL, $bindings = array(), $select = true)
            {
                $type = $bean->getMeta("type");
                $id = $bean->id;
                $rows = $this
                    ->writer
                    ->queryRecursiveCommonTableExpression(
                        $type,
                        $id, true,
                        $sql,
                        $bindings,
                        $select
                    );

                $first = reset($rows);
                $cell  = reset($first);

                return (
                    intval($cell) - (
                        (
                            $select === true && is_null($sql)
                        ) ? 1 : 0
                    )
                );
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        use RedBeanPHP\Facade as R;
        use RedBeanPHP\OODBBean;


        /**
         * Utilitário de recursos.
         *
         * A classe Feature Utility fornece uma maneira fácil
         * de ativar ou desativar recursos. Isso nos permite
         * introduzir novos recursos sem quebrar acidentalmente
         * a compatibilidade com versões anteriores.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Feature
        {
            /**
             * Constantes do conjunto de recursos.
             */
            const C_FEATURE_NOVICE_LATEST = "novice/latest";
            const C_FEATURE_LATEST = "latest";
            const C_FEATURE_NOVICE_5_5 = "novice/5.5";
            const C_FEATURE_5_5 = "5.5";
            const C_FEATURE_NOVICE_5_4 = "novice/5.4";
            const C_FEATURE_5_4 = "5.4";
            const C_FEATURE_NOVICE_5_3 = "novice/5.3";
            const C_FEATURE_5_3 = "5.3";
            const C_FEATURE_ORIGINAL = "original";

            /**
             * Seleciona o conjunto de recursos desejado conforme
             * especificado pelo rótulo.
             *
             * Etiquetas disponíveis:
             *
             * novice/latest:
             *     - Proibir R::nuke().
             *     - Habilitar o resolvedor automático de relações
             *       baseado em chaves estrangeiras.
             *     - Proibir R::store(All)( $bean, true ) (modo híbrido).
             *     - Use condições IS-NULL em findLike() etc.
             *
             * latest:
             *     - Permitir R::nuke().
             *     - Habilite a resolução automática.
             *     - Permitir modo híbrido.
             *     - Use condições IS-NULL em findLike() etc.
             *
             * novice/X or X:
             *     - Mantenha tudo como estava na versão X.
             *
             * Uso:
             *     <code>
             *         R::useFeatureSet("novice/latest");
             *     </code>
             *
             * @param string $label label.
             * @return void.
             */
            public static function feature($label)
            {
                switch($label)
                {
                    case self::C_FEATURE_NOVICE_LATEST:
                    case self::C_FEATURE_NOVICE_5_4:
                    case self::C_FEATURE_NOVICE_5_5:
                        OODBBean::useFluidCount(true);
                        R::noNuke(true);
                        R::setAllowHybridMode(false);
                        R::useISNULLConditions(true);
                        break;

                    case self::C_FEATURE_LATEST:
                    case self::C_FEATURE_5_4:
                    case self::C_FEATURE_5_5:
                        OODBBean::useFluidCount(true);
                        R::noNuke(false);
                        R::setAllowHybridMode(true);
                        R::useISNULLConditions(true);
                        break;

                    case self::C_FEATURE_NOVICE_5_3:
                        OODBBean::useFluidCount(true);
                        R::noNuke(true);
                        R::setAllowHybridMode(false);
                        R::useISNULLConditions(false);
                        break;

                    case self::C_FEATURE_5_3:
                        OODBBean::useFluidCount(true);
                        R::noNuke(false);
                        R::setAllowHybridMode(false);
                        R::useISNULLConditions(false);
                        break;

                    case self::C_FEATURE_ORIGINAL:
                        OODBBean::useFluidCount(true);
                        R::noNuke(false);
                        R::setAllowHybridMode(false);
                        R::useISNULLConditions(false);
                        break;

                    default:
                        throw new \Exception("Unknown feature set label.");
                        break;
                }
            }
        }
    }

    namespace RedBeanPHP\Util
    {
        /**
         * Qualquer um dos utilitários.
         *
         * A classe Either Utility fornece uma maneira fácil
         * de substituir o operador coalesce NULL no
         * RedBeanPHP (já que a interface de carregamento
         * lento interfere no operador ??) de uma forma que
         * também pode ser usada em versões mais antigas
         * do PHP.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        class Either
        {
            /**
             * @var mixed.
             */
            private $result;

            /**
             * Constrói uma nova instância de qualquer um.
             * Exemplo de uso:
             *     <code>
             *         $author = $text
             *             ->either()
             *             ->page
             *             ->book
             *             ->autor
             *             ->name
             *             ->or("unknown");
             *     </code>
             *
             * A classe Either permite acessar as propriedades do
             * bean sem precisar fazer verificações NULL. O
             * mecanismo lembra o uso do ?? um pouco, mas oferece
             * compatibilidade retroativa com versões mais antigas
             * do PHP. O mecanismo também funciona em arrays.
             *
             * <code>
             *     $budget = $company
             *         ->either()
             *         ->sharedProject
             *         ->first()
             *         ->budget
             *         ->or(0);
             * </code>
             */
            public function __construct($result)
            {
                $this->result = $result;
            }

            /**
             * Extrai um valor do objeto empacotado e o armazena
             * no objeto de resultado interno. Se o valor desejado
             * não puder ser encontrado, o objeto de resultado
             * interno será definido como NULL. Acorrentável.
             *
             * @param string $something Nome da propriedade da qual deseja
             *                          extrair o valor.
             * @return self.
             */
            public function __get($something)
            {
                if (is_object($this->result))
                {
                    $this->result = $this->result->{$something};
                } else
                {
                    $this->result = NULL;
                }

                return $this;
            }

            /**
             * Extrai o primeiro elemento do vetor no objeto
             * de resultado interno e o armazena como o novo
             * valor do objeto de resultado interno. Acorrentável.
             *
             * @return self.
             */
            public function first()
            {
                if (is_array($this->result))
                {
                    reset($this->result);
                    $key = key($this->result);

                    if (isset($this->result[$key]))
                    {
                        $this->result = $this->result[$key];
                    } else
                    {
                        $this->result = NULL;
                    }
                }

                return $this;
            }

            /**
             * Extrai o último elemento do vetor no objeto de
             * resultado interno e o armazena como o novo valor
             * do objeto de resultado interno. Acorrentável.
             *
             * @return self.
             */
            public function last()
            {
                if (is_array($this->result))
                {
                    end($this->result);
                    $key = key($this->result);

                    if (isset($this->result[$key]))
                    {
                        $this->result = $this->result[$key];
                    } else
                    {
                        $this->result = NULL;
                    }
                }

                return $this;
            }

            /**
             * Extrai o elemento especificado do vetor no objeto
             * de resultado interno e o armazena como o novo valor
             * do objeto de resultado interno. Acorrentável.
             *
             * @return self.
             */
            public function index($key = 0)
            {
                if (is_array($this->result))
                {
                    if (isset($this->result[$key]))
                    {
                        $this->result = $this->result[$key];
                    } else
                    {
                        $this->result = NULL;
                    }
                }

                return $this;
            }

            /**
             * Resolve a instância de qualquer um para um valor
             * final, seja o valor contido no objeto de resultado
             * interno ou o valor especificado na função or().
             *
             * @param mixed $value Valor a ser resolvido se o resultado
             *                     interno for igual a NULL.
             * @return mixed.
             */
            public function _or($value)
            {
                $reference = (
                    is_null(
                        $this->result
                    )
                ) ? $value : $this->result;

                return $reference;
            }
        }
    }

    namespace RedBeanPHP
    {
        /**
         * RedBean Plugin.
         * Interface de marcador para plugins. Use esta interface
         * ao definir novos plugins, é uma maneira fácil para o
         * resto do aplicativo reconhecer seu plugin. Esta
         * interface de plugin não requer que você implemente uma
         * API específica.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */
        interface Plugin
        {
        };
    }

    namespace {
        /**
         * Disponibilizar algumas classes para compatibilidade
         * com versões anteriores.
         */
        class RedBean_SimpleModel extends \RedBeanPHP\SimpleModel
        {
        };

        /**
         *
         */
        if (!class_exists("R"))
        {
            /**
             *
             */
            class R extends \RedBeanPHP\Facade
            {
            };
        }

        /**
         * Funções de suporte para RedBeanPHP. Funções
         * adicionais de atalho de conveniência para
         * RedBeanPHP.
         *
         * @author Chifrudo <chifrudo@localhost.com.br>
         * @license GPLv3.
         */

        /**
         * Função de conveniência para sintaxe curta ENUM
         * em consultas.
         *
         * Uso:
         *     <code>
         *         R::find("paint", " color_id = ? ", [EID("color:yellow")]);
         *     </code>
         *
         * Se uma função chamada EID() já existir, você mesmo
         * terá que escrever esse wrapper ;).
         *
         * @param string $enumName Código enum como você passaria para R::enum().
         * @return mixed.
         */
        if (!function_exists("EID"))
        {
            function EID($enumName)
            {
                return \RedBeanPHP\Facade::enum($enumName)->id;
            }
        }

        /**
         * Imprime o resultado de R::dump() na tela usando print_r.
         *
         * @param mixed $data dados para despejar.
         * @return void.
         */
        if (!function_exists("dmp"))
        {
            function dmp($list)
            {
                print_r(\RedBeanPHP\Facade::dump($list));
            }
        }

        /**
         * Alias de função para R::genSlots().
         */
        if (!function_exists("genslots"))
        {
            function genslots($slots, $tpl = NULL)
            {
                return \RedBeanPHP\Facade::genSlots($slots, $tpl);
            }
        }

        /**
         * Alias de função para R::flat().
         */
        if (!function_exists("array_flatten"))
        {
            function array_flatten($array)
            {
                return \RedBeanPHP\Facade::flat($array);
            }
        }

        /**
         * A função pstr() gera [$value, \PDO::PARAM_STR].
         * Garante que seu parâmetro esteja sendo tratado
         * como uma string.
         *
         * Uso:
         *     <code>
         *         R::find("book", "title = ?", [pstr("1")]);
         *     </code>
         */
        if (!function_exists("pstr"))
        {
            function pstr($value)
            {
                return array(
                    strval(
                        $value
                    ),

                    \PDO::PARAM_STR
                );
            }
        }

        /**
         * A função pint() gera [$value, \PDO::PARAM_INT].
         * Garante que seu parâmetro esteja sendo tratado
         * como um número inteiro.
         *
         * Uso:
         *     <code>
         *         R::find("book", " pages > ? ", [pint(2)]);
         *     </code>
         */
        if (!function_exists("pint"))
        {
            function pint($value)
            {
                return array(
                    intval(
                        $value
                    ),

                    \PDO::PARAM_INT
                );
            }
        }

        /**
         * A função DBPrefix() é uma função simples que permite
         * definir rapidamente um namespace diferente para a
         * resolução do modelo FUSE por conexão de banco de
         * dados. Funciona criando um novo DynamicBeanHelper
         * com a string especificada como prefixo do modelo.
         *
         * Uso:
         *     <code>
         *         R::addDatabase(..., DBPrefix("Prefix1_"));
         *     </code>
         */
        if (!function_exists("DBPrefix"))
        {
            function DBPrefix($prefix = "\\Model")
            {
                return new \RedBeanPHP\BeanHelper\DynamicBeanHelper($prefix);
            }
        }
    }
