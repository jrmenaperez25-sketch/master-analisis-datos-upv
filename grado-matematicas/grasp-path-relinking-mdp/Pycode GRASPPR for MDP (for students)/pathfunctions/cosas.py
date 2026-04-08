from pathfunctions import Pathrelinkin
import time

def elite_path_relinking(elite_set,tiempo): #funcion que aplica PR a las soluciones del eliteset
    start_time = time.time()
    path_solutions = [] #creamos lista vacia, donde irán las soluciones de todas las iteraciones del Path Relinking
    i = 0
    while i < len(elite_set) and time.time() - start_time < tiempo:  # Control de tiempo
        j = i + 1
        while j < len(elite_set) and time.time() - start_time < tiempo:  # Control de tiempo
            #print(f"Procesando combinación ({i}, {j})")
            initial_sol = elite_set[i]
            final_sol = elite_set[j]
            path_solution = Pathrelinkin.path_relinking(initial_sol, final_sol)  # Solución del PR
            path_solutions.append(path_solution)
            j += 1
        i += 1
    #print(f"Total combinaciones procesadas: {len(path_solutions)}")
    if path_solutions:  # Si hay soluciones generadas
        best_overall = max(path_solutions, key=lambda sol: sol['of'])  # Mejor solución obtenida
        return best_overall



    else:  # Si no se generaron soluciones
        return None
        #for i in range(len(elite_set)):
           # for j in range(i + 1, len(elite_set)):
            #    initial_sol = elite_set[i]
             #   final_sol = elite_set[j]
              #  path_solution = Pathrelinkin.path_relinking(initial_sol, final_sol) #Solucion del PR aplicándolo a esas dos soluciones
               # path_solutions.append(path_solution)

    #best_overall = max(path_solutions, key=lambda sol: sol['of']) #La mejor de todas las soluciones obtenidas

    #return best_overall