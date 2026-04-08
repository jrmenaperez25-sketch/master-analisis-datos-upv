from selectors import SelectSelector

from structure import solution
from localsearch import lsbestimp

def path_relinking(initial_sol, final_sol):
    to_add = final_sol['sol'] - initial_sol['sol'] #los nodos a añadir a la solución de la que partimos
    to_remove = initial_sol['sol'] - final_sol['sol'] #los nodos a eliminar de la solución de la que partimos
    current_sol = initial_sol.copy() #copia de la initial_sol para no modificarla
    intermediate_solutions = []

    while len(to_add) > 0 and len(to_remove) > 0:
        aux=0
        for add_node in to_add:
            for remove_node in to_remove:
                d=solution.distanceToSol(current_sol, add_node, without = remove_node)
                if aux==0 or aux<=d:
                    aux=d
                    quitacion = remove_node
                    ponecion = add_node
        solution.removeFromSolution(current_sol,quitacion)
        solution.addToSolution(current_sol,ponecion)
        intermediate_solutions.append(current_sol) #soluciones de cada paso del PathRelinking
        to_add = final_sol['sol']-current_sol['sol'] #actualización de los nodos restantes a añadir y eliminar
        to_remove = current_sol['sol']-final_sol['sol']
    best_intermediate = max(intermediate_solutions, key=lambda sol: sol['of']) #mejor solución intermedia, a la que aplicaremos LocalSearch

    lsbestimp.improve(best_intermediate)

    best_sol_path = (
        best_intermediate if best_intermediate['of'] > initial_sol['of'] else initial_sol
    ) #ver si la mejor solución encontrada por el PR es la final o la mejor de las intermedias tras aplicarle LocalSearch

    return best_sol_path