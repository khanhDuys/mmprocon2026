import numpy as np

def bayer(n): # gen bayer level n-1
    if n == 1: return np.array([[0, 2],
                               [3, 1]])
    recur = bayer(n-1)
    return np.block([[ (4*recur+0), (4*recur+2) ],
                    [ (4*recur+3), (4*recur+1) ]])

level = int(input("enter level of bayer "))
mat_name = input("enter name of mat ")
bay_mat = np.array(bayer(level+1))
bay_mat = bay_mat.T # loop will make the print flipped
cnt = 0
for i in bay_mat:
    for j in i:
        print(f"{mat_name}[{cnt}]={j}.0;", end=" ")
        cnt+=1
    print("")
