from constructives import cgrasp
from localsearch import lsbestimp
import time

def execute(inst, tiempo, alpha):
    all_solutions =[]
    start_time = time.time()  # Registra el tiempo inicial
    while time.time() - start_time < tiempo:  # Comprueba si el tiempo transcurrido es menor que el tiempo límite
        sol = cgrasp.construct(inst, alpha)
        lsbestimp.improve(sol)
        all_solutions.append(sol)

    return all_solutions
