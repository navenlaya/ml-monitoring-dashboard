from sklearn.datasets import fetch_california_housing
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import joblib
import pandas as pd

# Loads California housing dataset
data = fetch_california_housing()

# Converts to pandas DataFrame
x = pd.DataFrame(data.data, columns=data.feature_names)
y = pd.Series(data.target, name = 'target')

# Splits the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(x, y, test_size = 0.2, random_state = 42) # 80% train and 20% test split

# Creates a Linear Regression model
model = LinearRegression()
model.fit(X_train, y_train)

# Using Mean Squared Error, evaluate the model
predictions = model.predict(X_test)
mse = mean_squared_error(y_test, predictions)
print(f"Mean Squared Error: {mse:.4f}")

# Save model to .pkl file
joblib.dump(model, 'model.pkl')

# Prepare a test set CSV file
stream_data = X_test.copy()
stream_data['actual_prices'] = y_test.reset_index(drop = True)
stream_data.to_csv('data/simulated_stream.csv', index = False)

print("Model training complete and model saved as 'model.pkl'. Test data saved as 'data/stream_data.csv'.")


