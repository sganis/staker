:: Setup ssh keys from windows
:: ssh and ssh-keygen must be in PATH or script dir
:: 04/25/2021, San
@echo off
setlocal
setlocal EnableDelayedExpansion

if [%3]==[] goto :usage
if "%1"=="-h" goto :usage

set USER=%1
set HOST=%2
set PORT=%3

set DIR=%~dp0
set DIR=%DIR:~0,-1%
set USERHOST=%USER%@%HOST%
set SKEY=%USERPROFILE%\.ssh\id_rsa
set PKEY=%USERPROFILE%\.ssh\id_rsa.pub
set PATH=%DIR%;%PATH%

:: generate
if not exist %SKEY% (
	mkdir %USERPROFILE%\.ssh 2>nul
	ssh-keygen -q -N "" -f %SKEY%
)
:: test
call :test %USER% %HOST% %PORT% %SKEY%
if %ERRORLEVEL% neq 0 goto transfer
goto ok

:transfer
:: transfer public key using inline bash script:
::   use bash in case user has different shell
::   make .ssh/authorized_keys shorter with variable F 
::   cd HOME
::   umask permissions for file creation
::   mkdir .ssh if not there
::   tail adds new line if it's not there
::   cat saves the key 
::   sed removes windows line endings
::   finally check or add new line
type %PKEY% | ssh %USER%@%HOST% -p %PORT% 	^
	 	-oStrictHostKeyChecking=no 			^
		-oLogLevel=ERROR 					^
		"exec /bin/sh -c 'F=.ssh/authorized_keys; cd; umask 077; mkdir -p .ssh && { [ -z `tail -1c $F 2>/dev/null` ] || echo >> $F || exit 1; } && cat >> $F; sed -i ""s/\r//"" $F; [ -z `tail -1c $F 2>/dev/null` ] || echo >> $F'"
if %ERRORLEVEL% neq 0 goto fail

:: test again
call :test %USER% %HOST% %PORT% %SKEY%
if %ERRORLEVEL% neq 0 goto fail
goto :ok

:fail
echo FAILED
goto :eof

:ok
echo OK
goto :eof

:usage
echo usage: %0 [user] [host] [port]
exit /B 1
goto :eof

:test
ssh -i %SKEY% -p %PORT%    			^
	-oPasswordAuthentication=no 	^
	-oStrictHostKeyChecking=no 		^
	-oUserKnownHostsFile=/dev/null 	^
	-oLogLevel=ERROR  	        	^
	-oBatchMode=yes 				^
	%USER%@%HOST% true 2>nul
exit /B %ERRORLEVEL%

