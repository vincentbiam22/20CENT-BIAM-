export type Language = 'Python' | 'JavaScript' | 'TypeScript' | 'HTML' | 'SQL'
export type Project = { id: string; name: string; description: string; language: Language; time: string; color: string; files: Record<string, string> }

export const starters: Record<Language, Record<string, string>> = {
  Python: {
    'main.py': 'def saluer(nom: str) -> str:\n    """Le début de quelque chose de grand."""\n    return f"Bienvenue dans 20Code, {nom} !"\n\n\nif __name__ == "__main__":\n    message = saluer("créateur")\n    print(message)\n',
    'README.md': '# Mon projet Python\n\nCréé avec 20Code.\n'
  },
  JavaScript: { 'index.js': 'const saluer = (nom) => {\n  return `Bienvenue dans 20Code, ${nom} !`;\n};\n\nconsole.log(saluer("créateur"));\n' },
  TypeScript: { 'index.ts': 'function saluer(nom: string): string {\n  return `Bienvenue dans 20Code, ${nom} !`;\n}\n\nconsole.log(saluer("créateur"));\n' },
  HTML: { 'index.html': '<!doctype html>\n<html lang="fr">\n  <head>\n    <meta charset="UTF-8" />\n    <title>Mon projet 20Code</title>\n  </head>\n  <body>\n    <h1>Bienvenue dans 20Code</h1>\n    <p>Tout commence par une idée.</p>\n  </body>\n</html>\n' },
  SQL: { 'query.sql': "SELECT 'Bienvenue dans 20Code' AS message;\n" }
}

export const projects: Project[] = [
  { id: 'python', name: 'hello-python', description: 'Vos premiers pas avec Python', language: 'Python', time: 'Projet exemple', color: 'yellow', files: starters.Python },
  { id: 'web', name: 'mon-site-web', description: 'Une page, mille possibilités', language: 'HTML', time: 'Projet exemple', color: 'orange', files: starters.HTML },
  { id: 'typescript', name: 'playground-ts', description: 'Un terrain de jeu typé', language: 'TypeScript', time: 'Projet exemple', color: 'blue', files: starters.TypeScript }
]

export const assistantReplies = {
  explain: 'Dans cet exemple Python, la fonction saluer reçoit un nom et renvoie un message personnalisé. Le bloc __main__ appelle cette fonction, puis affiche son résultat. Vous pouvez modifier « créateur » pour essayer un autre nom.',
  improve: 'Pour améliorer cet exemple, vous pourriez vérifier que le nom n’est pas vide et ajouter un test pour la fonction saluer. Une fonction courte, un nom explicite et une responsabilité unique rendent le code plus facile à maintenir.',
  start: 'Commencez par « Nouveau projet », choisissez un langage et donnez un nom à votre idée. Les fichiers apparaîtront dans l’explorateur. Vous pourrez les modifier et exporter le fichier actif. L’exécution des runtimes sera connectée à l’étape suivante.'
}
