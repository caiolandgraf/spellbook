'use client'

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Play,
  Terminal,
  X,
  Zap
} from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CodeRunnerProps {
  code: string
  language: string
}

interface ExecutionResult {
  output: string
  error: string | null
  executionTime: number
  hasPreview?: boolean
  status: 'success' | 'error' | 'warning'
}

export function CodeRunner({ code, language }: CodeRunnerProps) {
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  // Função auxiliar para executar JavaScript com timeout
  const executeJavaScriptWithTimeout = (
    code: string,
    timeout = 5000
  ): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      const logs: string[] = []
      const originalLog = console.log
      const originalError = console.error
      const originalWarn = console.warn

      // Capturar todos os tipos de console
      console.log = (...args) => {
        logs.push(
          args
            .map(arg =>
              typeof arg === 'object'
                ? JSON.stringify(arg, null, 2)
                : String(arg)
            )
            .join(' ')
        )
      }

      console.error = (...args) => {
        logs.push('❌ ' + args.join(' '))
      }

      console.warn = (...args) => {
        logs.push('⚠️ ' + args.join(' '))
      }

      const timeoutId = setTimeout(() => {
        console.log = originalLog
        console.error = originalError
        console.warn = originalWarn
        reject(new Error('Execution timeout (5s)'))
      }, timeout)

      try {
        const result = eval(code)
        clearTimeout(timeoutId)

        if (result !== undefined && logs.length === 0) {
          logs.push(
            `↩️ Return value: ${typeof result === 'object' ? JSON.stringify(result, null, 2) : result}`
          )
        }

        console.log = originalLog
        console.error = originalError
        console.warn = originalWarn
        resolve(logs)
      } catch (err: any) {
        clearTimeout(timeoutId)
        console.log = originalLog
        console.error = originalError
        console.warn = originalWarn
        reject(err)
      }
    })
  }

  // Interpretador Python com suporte a funções
  const parsePython = (code: string): string[] => {
    const logs: string[] = []
    const variables: Record<string, any> = {}
    const functions: Record<string, { params: string[]; body: string[] }> = {}

    const lines = code.split('\n')
    let i = 0

    // Função auxiliar para avaliar expressões Python
    const evalPythonExpression = (expr: string): any => {
      expr = expr.trim()

      // String literals
      if (expr.match(/^['"].*['"]$/)) {
        return expr.slice(1, -1)
      }

      // Números
      if (!isNaN(Number(expr))) {
        return Number(expr)
      }

      // Booleanos
      if (expr === 'True') return true
      if (expr === 'False') return false
      if (expr === 'None') return null

      // Variáveis
      if (variables[expr] !== undefined) {
        return variables[expr]
      }

      // Operações matemáticas simples
      const mathMatch = expr.match(/^(\w+|\d+)\s*([+\-*/%])\s*(\w+|\d+)$/)
      if (mathMatch) {
        const [, left, op, right] = mathMatch
        const leftVal = evalPythonExpression(left)
        const rightVal = evalPythonExpression(right)

        switch (op) {
          case '+':
            return leftVal + rightVal
          case '-':
            return leftVal - rightVal
          case '*':
            return leftVal * rightVal
          case '/':
            return leftVal / rightVal
          case '%':
            return leftVal % rightVal
          default:
            return `[${expr}]`
        }
      }

      // Chamada de função
      const funcCallMatch = expr.match(/^(\w+)\s*\((.*)\)$/)
      if (funcCallMatch) {
        const [, funcName, argsStr] = funcCallMatch

        if (functions[funcName]) {
          const args = argsStr
            .split(',')
            .map(arg => evalPythonExpression(arg.trim()))
          const func = functions[funcName]

          // Criar escopo local
          const localVars: Record<string, any> = {}
          func.params.forEach((param, idx) => {
            localVars[param] = args[idx]
          })

          // Executar corpo da função
          let returnValue = null
          for (const line of func.body) {
            const returnMatch = line.trim().match(/^return\s+(.+)$/)
            if (returnMatch) {
              const returnExpr = returnMatch[1]
              // Substituir parâmetros
              let expr = returnExpr
              Object.keys(localVars).forEach(key => {
                expr = expr.replace(
                  new RegExp(`\\b${key}\\b`, 'g'),
                  String(localVars[key])
                )
              })
              returnValue = evalPythonExpression(expr)
              break
            }
          }

          return returnValue
        }

        // Funções built-in
        if (funcName === 'len') {
          const arg = evalPythonExpression(argsStr)
          return String(arg).length
        }
        if (funcName === 'str') {
          return String(evalPythonExpression(argsStr))
        }
        if (funcName === 'int') {
          return parseInt(argsStr)
        }

        return `[${funcName}(${argsStr})]`
      }

      // F-strings
      if (expr.startsWith('f"') || expr.startsWith("f'")) {
        let str = expr.slice(2, -1)
        const interpolations = str.match(/\{([^}]+)\}/g)
        if (interpolations) {
          interpolations.forEach(interp => {
            const expression = interp.slice(1, -1)
            const value = evalPythonExpression(expression)
            str = str.replace(interp, String(value))
          })
        }
        return str
      }

      return `[${expr}]`
    }

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      // Definição de função
      const funcDefMatch = trimmed.match(/^def\s+(\w+)\s*\((.*?)\)\s*:\s*$/)
      if (funcDefMatch) {
        const [, funcName, paramsStr] = funcDefMatch
        const params = paramsStr ? paramsStr.split(',').map(p => p.trim()) : []
        const body: string[] = []

        i++
        while (
          i < lines.length &&
          (lines[i].startsWith('    ') || lines[i].trim() === '')
        ) {
          if (lines[i].trim()) {
            body.push(lines[i])
          }
          i++
        }

        functions[funcName] = { params, body }
        continue
      }

      // Atribuição de variável
      const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/)
      if (assignMatch && !trimmed.includes('==')) {
        const [, varName, value] = assignMatch
        variables[varName] = evalPythonExpression(value)
        i++
        continue
      }

      // Print statement
      const printMatch = trimmed.match(/^print\s*\((.+)\)\s*$/)
      if (printMatch) {
        const content = printMatch[1].trim()
        const result = evalPythonExpression(content)
        logs.push(String(result))
      }

      i++
    }

    return logs
  }

  // Interpretador PHP com suporte a funções
  const parsePHP = (code: string): string[] => {
    const logs: string[] = []
    const variables: Record<string, any> = {}
    const functions: Record<string, { params: string[]; body: string[] }> = {}

    const lines = code.split('\n')
    let i = 0

    // Função auxiliar para avaliar expressões PHP
    const evalPHPExpression = (expr: string): any => {
      expr = expr.trim()

      // String literals
      if (expr.match(/^['"].*['"]$/)) {
        return expr.slice(1, -1)
      }

      // Números
      if (!isNaN(Number(expr))) {
        return Number(expr)
      }

      // Booleanos
      if (expr === 'true') return true
      if (expr === 'false') return false
      if (expr === 'null') return null

      // Variáveis
      if (expr.startsWith('$') && variables[expr] !== undefined) {
        return variables[expr]
      }

      // Operações matemáticas simples
      const mathMatch = expr.match(/^(\$?\w+|\d+)\s*([+\-*/%])\s*(\$?\w+|\d+)$/)
      if (mathMatch) {
        const [, left, op, right] = mathMatch
        const leftVal = evalPHPExpression(left)
        const rightVal = evalPHPExpression(right)

        switch (op) {
          case '+':
            return leftVal + rightVal
          case '-':
            return leftVal - rightVal
          case '*':
            return leftVal * rightVal
          case '/':
            return leftVal / rightVal
          case '%':
            return leftVal % rightVal
          default:
            return `[${expr}]`
        }
      }

      // Concatenação com .
      if (expr.includes('.')) {
        const parts = expr.split('.').map(p => p.trim())
        return parts
          .map(p => {
            const val = evalPHPExpression(p)
            return String(val)
          })
          .join('')
      }

      // Chamada de função
      const funcCallMatch = expr.match(/^(\w+)\s*\((.*)\)$/)
      if (funcCallMatch) {
        const [, funcName, argsStr] = funcCallMatch

        if (functions[funcName]) {
          const args = argsStr
            .split(',')
            .map(arg => evalPHPExpression(arg.trim()))
          const func = functions[funcName]

          // Criar escopo local
          const localVars: Record<string, any> = {}
          func.params.forEach((param, idx) => {
            localVars[param] = args[idx]
          })

          // Executar corpo da função
          let returnValue = null
          for (const line of func.body) {
            const returnMatch = line.trim().match(/^return\s+(.+?);$/)
            if (returnMatch) {
              let returnExpr = returnMatch[1]
              // Substituir parâmetros
              Object.keys(localVars).forEach(key => {
                returnExpr = returnExpr.replace(
                  new RegExp(`\\${key}\\b`, 'g'),
                  String(localVars[key])
                )
              })
              returnValue = evalPHPExpression(returnExpr)
              break
            }
          }

          return returnValue
        }

        // Funções built-in
        if (funcName === 'strlen') {
          const arg = evalPHPExpression(argsStr)
          return String(arg).length
        }
        if (funcName === 'strtoupper') {
          const arg = evalPHPExpression(argsStr)
          return String(arg).toUpperCase()
        }
        if (funcName === 'strtolower') {
          const arg = evalPHPExpression(argsStr)
          return String(arg).toLowerCase()
        }

        return `[${funcName}(${argsStr})]`
      }

      return `[${expr}]`
    }

    while (i < lines.length) {
      const line = lines[i]
      const trimmed = line.trim()

      // Pular <?php e ?>
      if (trimmed === '<?php' || trimmed === '?>') {
        i++
        continue
      }

      // Definição de função
      const funcDefMatch = trimmed.match(
        /^function\s+(\w+)\s*\((.*?)\)\s*\{?\s*$/
      )
      if (funcDefMatch) {
        const [, funcName, paramsStr] = funcDefMatch
        const params = paramsStr ? paramsStr.split(',').map(p => p.trim()) : []
        const body: string[] = []

        i++
        let braceCount = 1
        while (i < lines.length && braceCount > 0) {
          const bodyLine = lines[i].trim()
          if (bodyLine === '}') {
            braceCount--
            if (braceCount === 0) break
          }
          if (bodyLine.endsWith('{')) {
            braceCount++
          }
          if (bodyLine && bodyLine !== '{' && bodyLine !== '}') {
            body.push(lines[i])
          }
          i++
        }

        functions[funcName] = { params, body }
        i++
        continue
      }

      // Atribuição de variável
      const assignMatch = trimmed.match(/^(\$\w+)\s*=\s*(.+?);$/)
      if (assignMatch) {
        const [, varName, value] = assignMatch
        variables[varName] = evalPHPExpression(value)
        i++
        continue
      }

      // Echo statement
      const echoMatch = trimmed.match(/^echo\s+(.+?);$/)
      if (echoMatch) {
        const content = echoMatch[1].trim()
        const result = evalPHPExpression(content)
        logs.push(String(result))
        i++
        continue
      }

      // Print statement
      const printMatch = trimmed.match(/^print\s+(.+?);$/)
      if (printMatch) {
        const content = printMatch[1].trim()
        const result = evalPHPExpression(content)
        logs.push(String(result))
        i++
        continue
      }

      i++
    }

    return logs
  }

  // Gerador de SQL results mais realista
  const generateSQLResult = (query: string): string => {
    const upperQuery = query.toUpperCase().trim()

    if (upperQuery.startsWith('SELECT')) {
      // Extrair colunas se possível
      const selectMatch = query.match(/SELECT\s+(.+?)\s+FROM/i)
      const columns = selectMatch
        ? selectMatch[1]
            .split(',')
            .map(c => c.trim().replace('*', 'id, name, value'))
        : ['id', 'name', 'value']

      let result = '📊 SQL Query Results\n\n'
      result += '┌─────────┬──────────────┬─────────┐\n'
      result += '│ id      │ name         │ value   │\n'
      result += '├─────────┼──────────────┼─────────┤\n'
      result += '│ 1       │ Item Alpha   │ 150.00  │\n'
      result += '│ 2       │ Item Beta    │ 275.50  │\n'
      result += '│ 3       │ Item Gamma   │ 89.99   │\n'
      result += '│ 4       │ Item Delta   │ 320.00  │\n'
      result += '└─────────┴──────────────┴─────────┘\n'
      result += '\n✅ 4 rows returned'

      return result
    }

    if (upperQuery.startsWith('INSERT')) {
      return '✅ INSERT Query\n\n1 row inserted successfully\n\n💡 Affected rows: 1'
    }

    if (upperQuery.startsWith('UPDATE')) {
      return '✅ UPDATE Query\n\n2 rows updated successfully\n\n💡 Affected rows: 2'
    }

    if (upperQuery.startsWith('DELETE')) {
      return '✅ DELETE Query\n\n1 row deleted successfully\n\n💡 Affected rows: 1'
    }

    if (upperQuery.startsWith('CREATE')) {
      return '✅ CREATE Table\n\nTable created successfully\n\n📊 Structure ready for data'
    }

    if (upperQuery.startsWith('ALTER')) {
      return '✅ ALTER Table\n\nTable structure modified successfully'
    }

    if (upperQuery.startsWith('DROP')) {
      return '⚠️ DROP Table\n\nTable would be deleted\n\n🚨 This is a destructive operation'
    }

    return '✅ Query executed successfully'
  }

  const runCode = async () => {
    setIsRunning(true)
    setResult(null)

    const startTime = performance.now()

    try {
      const lang = language.toLowerCase()
      let output = ''
      let error: string | null = null
      let status: 'success' | 'error' | 'warning' = 'success'
      let hasPreview = false

      if (lang === 'javascript' || lang === 'js') {
        try {
          const logs = await executeJavaScriptWithTimeout(code)
          output =
            logs.length > 0
              ? logs.join('\n')
              : '✨ Code executed successfully (no output)'
        } catch (err: any) {
          error = err.message
          status = 'error'
        }
      } else if (lang === 'typescript' || lang === 'ts') {
        try {
          // Melhor remoção de tipos TypeScript
          let jsCode = code
          // Remove interfaces
          jsCode = jsCode.replace(/interface\s+\w+[^{]*\{[^}]*\}/g, '')
          // Remove type aliases
          jsCode = jsCode.replace(/type\s+\w+[^=]*=\s*[^;]+;/g, '')
          // Remove type annotations
          jsCode = jsCode.replace(/:\s*[\w<>\[\]|&]+/g, '')
          // Remove generics
          jsCode = jsCode.replace(/<[\w\s,<>[\]]+>/g, '')
          // Remove type assertions
          jsCode = jsCode.replace(/as\s+\w+/g, '')

          const logs = await executeJavaScriptWithTimeout(jsCode)
          output =
            logs.length > 0
              ? logs.join('\n')
              : '✨ TypeScript code executed successfully (no output)'
        } catch (err: any) {
          error = err.message
          status = 'error'
        }
      } else if (lang === 'python' || lang === 'py') {
        const logs = parsePython(code)

        if (logs.length > 0) {
          output = '🐍 Python Output\n\n' + logs.join('\n')
        } else {
          output = '🐍 Python\n\n✨ Code would execute successfully'
          status = 'warning'
        }

        output +=
          '\n\n💡 Simulated execution - Full Python support requires Pyodide'
      } else if (lang === 'php') {
        const logs = parsePHP(code)

        if (logs.length > 0) {
          output = '🐘 PHP Output\n\n' + logs.join('\n')
        } else {
          output = '🐘 PHP\n\n✨ Code would execute successfully'
          status = 'warning'
        }

        output +=
          '\n\n💡 Simulated execution - Full PHP support requires server-side runtime'
      } else if (lang === 'html') {
        output = '📄 HTML Preview\n\nRendering HTML in preview pane...'
        hasPreview = true

        setTimeout(() => {
          const iframe = document.createElement('iframe')
          iframe.style.width = '100%'
          iframe.style.height = '450px'
          iframe.style.border = '1px solid rgba(255, 189, 89, 0.3)'
          iframe.style.borderRadius = '8px'
          iframe.style.backgroundColor = '#fff'
          iframe.sandbox.add('allow-scripts')

          const outputElement = document.querySelector(
            '.html-preview-container'
          )
          if (outputElement) {
            outputElement.innerHTML = ''
            outputElement.appendChild(iframe)

            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow?.document
            if (iframeDoc) {
              iframeDoc.open()
              iframeDoc.write(code)
              iframeDoc.close()
            }
          }
        }, 100)
      } else if (lang === 'css') {
        output = '🎨 CSS Preview\n\nApplying styles to demo page...'
        hasPreview = true

        const sampleHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; }
    ${code}
  </style>
</head>
<body>
  <div class="container">
    <h1>CSS Preview Demo</h1>
    <p>Your custom styles are applied to this page.</p>
    <button>Click Me</button>
    <div class="box">Sample Box Element</div>
    <ul>
      <li>List item 1</li>
      <li>List item 2</li>
      <li>List item 3</li>
    </ul>
  </div>
</body>
</html>`

        setTimeout(() => {
          const iframe = document.createElement('iframe')
          iframe.style.width = '100%'
          iframe.style.height = '450px'
          iframe.style.border = '1px solid rgba(255, 189, 89, 0.3)'
          iframe.style.borderRadius = '8px'
          iframe.style.backgroundColor = '#fff'

          const outputElement = document.querySelector(
            '.html-preview-container'
          )
          if (outputElement) {
            outputElement.innerHTML = ''
            outputElement.appendChild(iframe)

            const iframeDoc =
              iframe.contentDocument || iframe.contentWindow?.document
            if (iframeDoc) {
              iframeDoc.open()
              iframeDoc.write(sampleHTML)
              iframeDoc.close()
            }
          }
        }, 100)
      } else if (lang === 'sql') {
        output = generateSQLResult(code)
        output += '\n\n💡 Simulated execution - No real database connection'
        status = 'warning'
      } else {
        output = `⚠️ Language "${language}" is not yet supported\n\n`
        output += '✅ Fully Supported:\n'
        output += '  • JavaScript - Real execution\n'
        output += '  • TypeScript - Real execution\n\n'
        output += '🎭 Simulated:\n'
        output += '  • Python - Output preview\n'
        output += '  • PHP - Output preview\n'
        output += '  • SQL - Query simulation\n\n'
        output += '🎨 Preview:\n'
        output += '  • HTML - Live preview\n'
        output += '  • CSS - Live preview\n\n'
        output += '🔜 Coming soon: Java, C++, Go, Rust'
        status = 'warning'
      }

      const executionTime = performance.now() - startTime

      setResult({
        output,
        error,
        executionTime,
        hasPreview,
        status
      })
    } catch (err: any) {
      const executionTime = performance.now() - startTime
      setResult({
        output: '',
        error: err.message || 'Unknown error occurred',
        executionTime,
        status: 'error'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const clearOutput = () => {
    setResult(null)
    const preview = document.querySelector('.html-preview-container')
    if (preview) {
      preview.innerHTML = ''
    }
  }

  const getStatusIcon = () => {
    if (!result) return null

    if (result.error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />
    }

    if (result.status === 'warning') {
      return <Eye className="w-4 h-4 text-yellow-500" />
    }

    return <CheckCircle2 className="w-4 h-4 text-green-500" />
  }

  const getStatusBadge = () => {
    if (!result) return null

    if (result.error) {
      return (
        <Badge variant="destructive" className="ml-2">
          Error
        </Badge>
      )
    }

    if (result.status === 'warning') {
      return (
        <Badge
          variant="outline"
          className="ml-2 border-yellow-500 text-yellow-500"
        >
          Simulated
        </Badge>
      )
    }

    return (
      <Badge variant="outline" className="ml-2 border-green-500 text-green-500">
        Success
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <Terminal className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Code Execution</CardTitle>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={runCode}
            disabled={isRunning || !code.trim()}
            className="gap-2"
          >
            {isRunning ? (
              <>
                <Zap className="w-4 h-4 animate-pulse" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Run Code
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex gap-2 flex-col">
        {result && (
          <div className="flex items-center gap-2 p-2 justify-between bg-background rounded-lg border">
            {getStatusBadge()}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {result.executionTime.toFixed(2)}ms
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearOutput}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
        {result ? (
          <>
            {result.error ? (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-500 mb-1">
                      Execution Error
                    </p>
                    <pre className="text-sm font-mono text-red-400 whitespace-pre-wrap">
                      {result.error}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-muted/50 rounded-lg p-4 border border-border">
                  <div className="flex items-start gap-2">
                    {getStatusIcon()}
                    <pre className="text-sm font-mono whitespace-pre-wrap flex-1 leading-relaxed">
                      {result.output}
                    </pre>
                  </div>
                </div>
                {result.hasPreview && (
                  <div className="html-preview-container mt-4" />
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
            <Terminal className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium mb-1">Ready to execute</p>
            <p className="text-xs">Click "Run Code" to see the output</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
